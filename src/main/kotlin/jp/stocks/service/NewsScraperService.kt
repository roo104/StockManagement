package jp.stocks.service

import jp.stocks.model.dto.ScrapedNewsItem
import kotlinx.coroutines.reactor.awaitSingle
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.nodes.Element
import org.jsoup.parser.Parser
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import java.net.URI
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

@Service
class NewsScraperService(
    webClientBuilder: WebClient.Builder,
) {

    private val logger = LoggerFactory.getLogger(NewsScraperService::class.java)

    private val webClient: WebClient = webClientBuilder
        .defaultHeader(
            HttpHeaders.USER_AGENT,
            "Mozilla/5.0 (compatible; StockNewsBot/1.0; +https://github.com/)",
        )
        .defaultHeader(HttpHeaders.ACCEPT, "text/html,application/xhtml+xml,application/xml,application/rss+xml;q=0.9,*/*;q=0.8")
        .build()

    private val maxItemsPerScrape = 50

    suspend fun scrape(pageUrl: String): List<ScrapedNewsItem> {
        val body = fetch(pageUrl) ?: return emptyList()
        val document = Jsoup.parse(body, pageUrl)

        val feedUrl = findFeedUrl(document, pageUrl)
        if (feedUrl != null) {
            logger.debug("Found feed for {}: {}", pageUrl, feedUrl)
            val feedBody = fetch(feedUrl)
            if (feedBody != null) {
                val items = parseFeed(feedBody, feedUrl)
                if (items.isNotEmpty()) return items.take(maxItemsPerScrape)
                logger.debug("Feed at {} yielded no items, falling back to HTML scrape", feedUrl)
            }
        }

        return parseHtml(document, pageUrl).take(maxItemsPerScrape)
    }

    private suspend fun fetch(url: String): String? {
        return try {
            webClient.get()
                .uri(URI.create(url))
                .retrieve()
                .bodyToMono(String::class.java)
                .awaitSingle()
        } catch (e: Exception) {
            logger.warn("Failed to fetch {}: {}", url, e.message)
            null
        }
    }

    private fun findFeedUrl(doc: Document, baseUrl: String): String? {
        val link = doc.selectFirst(
            "link[rel=alternate][type*=rss], link[rel=alternate][type*=atom], link[rel=alternate][type*=xml]",
        ) ?: return null
        val href = link.attr("href").ifBlank { return null }
        return resolveUrl(baseUrl, href)
    }

    private fun parseFeed(body: String, feedUrl: String): List<ScrapedNewsItem> {
        val doc = Jsoup.parse(body, feedUrl, Parser.xmlParser())
        val items = mutableListOf<ScrapedNewsItem>()

        // RSS 2.0
        for (item in doc.select("item")) {
            val title = item.selectFirst("title")?.text()?.trim().orEmpty()
            val link = item.selectFirst("link")?.text()?.trim()?.takeIf { it.isNotBlank() }
                ?: item.selectFirst("guid")?.text()?.trim().orEmpty()
            val pubDate = item.selectFirst("pubDate")?.text()?.let { parseDate(it) }
            val description = item.selectFirst("description")?.text()?.let { cleanText(it) }
            if (title.isNotBlank() && link.isNotBlank()) {
                items += ScrapedNewsItem(
                    articleUrl = resolveUrl(feedUrl, link),
                    headline = title,
                    summary = description,
                    publishedAt = pubDate,
                )
            }
        }

        // Atom
        for (entry in doc.select("entry")) {
            val title = entry.selectFirst("title")?.text()?.trim().orEmpty()
            val linkEl = entry.selectFirst("link[rel=alternate], link")
            val link = (linkEl?.attr("href")?.ifBlank { null } ?: linkEl?.text())?.trim().orEmpty()
            val published = (entry.selectFirst("published")?.text()
                ?: entry.selectFirst("updated")?.text())?.let { parseDate(it) }
            val summary = (entry.selectFirst("summary")?.text()
                ?: entry.selectFirst("content")?.text())?.let { cleanText(it) }
            if (title.isNotBlank() && link.isNotBlank()) {
                items += ScrapedNewsItem(
                    articleUrl = resolveUrl(feedUrl, link),
                    headline = title,
                    summary = summary,
                    publishedAt = published,
                )
            }
        }

        return items
    }

    private fun parseHtml(doc: Document, baseUrl: String): List<ScrapedNewsItem> {
        // Try several common container patterns. Stop at the first selector that yields candidates.
        val selectors = listOf(
            "article",
            "li:has(a):has(time)",
            "div:has(> a):has(time)",
            "li:has(a):has(.date)",
            "div.news-item, div.press-release, li.press-release",
        )

        val seen = mutableSetOf<String>()
        val results = mutableListOf<ScrapedNewsItem>()

        for (selector in selectors) {
            val nodes = doc.select(selector)
            if (nodes.isEmpty()) continue
            for (node in nodes) {
                val item = extractFromNode(node, baseUrl) ?: continue
                if (seen.add(item.articleUrl)) results += item
            }
            if (results.isNotEmpty()) break
        }

        return results
    }

    private fun extractFromNode(node: Element, baseUrl: String): ScrapedNewsItem? {
        val anchor = node.selectFirst("a[href]") ?: return null
        val href = anchor.attr("href").ifBlank { return null }
        val articleUrl = resolveUrl(baseUrl, href)
        if (articleUrl.startsWith("javascript:") || articleUrl.startsWith("#")) return null

        val headline = sequenceOf("h1", "h2", "h3", "h4")
            .mapNotNull { node.selectFirst(it)?.text()?.trim()?.takeIf { t -> t.isNotBlank() } }
            .firstOrNull()
            ?: anchor.text().trim().ifBlank { return null }

        val publishedAt = node.selectFirst("time[datetime]")?.attr("datetime")?.let { parseDate(it) }
            ?: node.selectFirst("time")?.text()?.let { parseDate(it) }
            ?: node.selectFirst(".date, .news-date, .press-date")?.text()?.let { parseDate(it) }

        val summary = node.selectFirst("p")?.text()?.trim()?.let { cleanText(it) }

        return ScrapedNewsItem(
            articleUrl = articleUrl,
            headline = cleanText(headline) ?: headline,
            summary = summary,
            publishedAt = publishedAt,
        )
    }

    private fun resolveUrl(base: String, href: String): String {
        return try {
            URI.create(base).resolve(href.trim()).toString()
        } catch (_: Exception) {
            href
        }
    }

    private fun cleanText(raw: String): String? {
        val collapsed = raw.replace(Regex("\\s+"), " ").trim()
        if (collapsed.isBlank()) return null
        // Strip HTML if any leaked in via description/summary fields
        val stripped = Jsoup.parse(collapsed).text().trim()
        return stripped.ifBlank { null }?.take(4000)
    }

    private fun parseDate(raw: String?): LocalDateTime? {
        if (raw.isNullOrBlank()) return null
        val value = raw.trim()

        // ISO-8601 with offset / zone
        runCatching { return OffsetDateTime.parse(value).toLocalDateTime() }
        runCatching { return ZonedDateTime.parse(value).toLocalDateTime() }
        runCatching { return LocalDateTime.parse(value) }
        runCatching { return LocalDate.parse(value).atStartOfDay() }

        // RFC 1123 (RSS pubDate): "Wed, 21 May 2025 14:00:00 GMT"
        runCatching {
            return OffsetDateTime.parse(value, DateTimeFormatter.RFC_1123_DATE_TIME).toLocalDateTime()
        }

        // Common human-readable formats
        val patterns = listOf(
            "MMM d, yyyy",
            "MMMM d, yyyy",
            "d MMM yyyy",
            "d MMMM yyyy",
            "yyyy-MM-dd HH:mm:ss",
            "yyyy/MM/dd",
            "MM/dd/yyyy",
            "dd/MM/yyyy",
        )
        for (pattern in patterns) {
            val fmt = DateTimeFormatter.ofPattern(pattern, Locale.ENGLISH)
            runCatching { return LocalDate.parse(value, fmt).atStartOfDay() }
            runCatching { return LocalDateTime.parse(value, fmt) }
        }

        // Fallback: try as epoch seconds offset (UTC)
        value.toLongOrNull()?.let { epoch ->
            return LocalDateTime.ofEpochSecond(epoch, 0, ZoneOffset.UTC)
        }

        return null
    }
}
