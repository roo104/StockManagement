import {Link} from 'react-router-dom';
import {Button} from '@/components/ui/button';

export default function NotFoundPage() {
    return (
        <div className="grid min-h-[60vh] place-items-center">
            <div className="space-y-4 text-center">
                <div className="text-7xl font-bold tracking-tight bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
                    404
                </div>
                <p className="text-[color:var(--color-fg-muted)]">
                    That page doesn't exist.
                </p>
                <Button asChild>
                    <Link to="/">Back to dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
