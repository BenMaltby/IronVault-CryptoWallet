'use client';

import {ReactNode} from 'react';

type UsecaseCardProps = {
    title: string;
    description: string;
    children: ReactNode;
};

export default function UsecaseCard({
                                        title,
                                        description,
                                        children,
                                    }: UsecaseCardProps) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="mt-1 text-sm text-zinc-400">{description}</p>
            </div>

            {children}
        </div>
    );
}
