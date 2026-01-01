// Browsing History Manager
export const browsingHistory = {
    // Add product to browsing history
    addProduct(productId: string, categoryId: string) {
        if (typeof window === 'undefined') return;

        const history = this.getHistory();

        // Add to front, remove duplicates
        const newHistory = [
            { productId, categoryId, timestamp: Date.now() },
            ...history.filter(h => h.productId !== productId)
        ].slice(0, 50); // Keep last 50 items

        localStorage.setItem('zaree_browsing_history', JSON.stringify(newHistory));
    },

    // Get browsing history
    getHistory(): Array<{ productId: string; categoryId: string; timestamp: number }> {
        if (typeof window === 'undefined') return [];

        try {
            const stored = localStorage.getItem('zaree_browsing_history');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    // Get frequently viewed categories (for recommendations)
    getTopCategories(limit = 5): string[] {
        const history = this.getHistory();

        // Count category occurrences
        const categoryCount = history.reduce((acc, item) => {
            acc[item.categoryId] = (acc[item.categoryId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Sort by count and return top N
        return Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([categoryId]) => categoryId)
            .filter(Boolean);
    },

    // Get recently viewed product IDs
    getRecentProductIds(limit = 10): string[] {
        return this.getHistory()
            .slice(0, limit)
            .map(h => h.productId);
    },

    // Clear history
    clear() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('zaree_browsing_history');
    }
};
