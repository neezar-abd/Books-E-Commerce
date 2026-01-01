import { supabase } from './supabase';

export interface RecommendationResult {
    products: any[];
    reason: string;
}

export const recommendationEngine = {

    /**
     * Get personalized recommendations for a user
     * Uses multiple algorithms and combines results
     */
    async getRecommendations(userId?: string, limit = 12): Promise<RecommendationResult> {
        const recommendations: any[] = [];
        let reason = 'Produk Terlaris';

        try {
            if (userId) {
                // Strategy 1: Collaborative Filtering (users who bought X also bought Y)
                const collaborativeRecs = await this.getCollaborativeRecommendations(userId, 6);
                recommendations.push(...collaborativeRecs);

                // Strategy 2: Category-based from order history
                const categoryRecs = await this.getCategoryBasedRecommendations(userId, 6);
                recommendations.push(...categoryRecs);

                if (recommendations.length > 0) {
                    reason = 'Berdasarkan Pembelian Anda';
                }
            }

            // Strategy 3: Trending/Popular products (fallback or additional)
            if (recommendations.length < limit) {
                const popularRecs = await this.getPopularProducts(limit - recommendations.length);
                recommendations.push(...popularRecs);

                if (!userId) {
                    reason = 'Produk Terlaris';
                }
            }

            // Remove duplicates
            const uniqueProducts = this.removeDuplicates(recommendations);

            // Shuffle and limit
            return {
                products: this.shuffleArray(uniqueProducts).slice(0, limit),
                reason
            };

        } catch (error) {
            console.error('Error getting recommendations:', error);

            // Fallback to popular products
            const popular = await this.getPopularProducts(limit);
            return {
                products: popular,
                reason: 'Produk Terlaris'
            };
        }
    },

    /**
     * Collaborative Filtering: Find products that other users bought together
     */
    async getCollaborativeRecommendations(userId: string, limit: number): Promise<any[]> {
        try {
            // Step 1: Get products that current user bought
            const { data: userProducts } = await supabase
                .from('order_items')
                .select('product_id, orders!inner(user_id)')
                .eq('orders.user_id', userId);

            if (!userProducts || userProducts.length === 0) return [];

            const userProductIds = userProducts.map(p => p.product_id);

            // Step 2: Find other users who bought the same products
            const { data: similarUsers } = await supabase
                .from('order_items')
                .select('orders!inner(user_id)')
                .in('product_id', userProductIds)
                .neq('orders.user_id', userId)
                .limit(50);

            if (!similarUsers || similarUsers.length === 0) return [];

            const similarUserIds = [...new Set(similarUsers.map((u: any) => u.orders.user_id))];

            // Step 3: Find products those users bought (but current user hasn't)
            const { data: recommendations } = await supabase
                .from('order_items')
                .select(`
          product_id,
          products (*)
        `)
                .in('orders.user_id', similarUserIds)
                .not('product_id', 'in', `(${userProductIds.join(',')})`)
                .limit(limit * 3); // Get more for filtering

            if (!recommendations) return [];

            // Count frequency and return top products
            const productFrequency = recommendations.reduce((acc: any, item: any) => {
                const key = item.product_id;
                if (!acc[key]) {
                    acc[key] = { product: item.products, count: 0 };
                }
                acc[key].count++;
                return acc;
            }, {});

            return Object.values(productFrequency)
                .sort((a: any, b: any) => b.count - a.count)
                .slice(0, limit)
                .map((item: any) => item.product);

        } catch (error) {
            console.error('Collaborative filtering error:', error);
            return [];
        }
    },

    /**
     * Category-based recommendations from user's order history
     */
    async getCategoryBasedRecommendations(userId: string, limit: number): Promise<any[]> {
        try {
            // Get user's preferred categories from order history
            const { data: orders } = await supabase
                .from('orders')
                .select(`
          order_items (
            products (
              category_id
            )
          )
        `)
                .eq('user_id', userId)
                .limit(20);

            if (!orders) return [];

            // Extract category IDs
            const categoryIds = new Set<string>();
            orders.forEach((order: any) => {
                order.order_items?.forEach((item: any) => {
                    if (item.products?.category_id) {
                        categoryIds.add(item.products.category_id);
                    }
                });
            });

            if (categoryIds.size === 0) return [];

            // Get top products from those categories
            const { data: products } = await supabase
                .from('products')
                .select('*')
                .in('category_id', Array.from(categoryIds))
                .order('total_sold', { ascending: false })
                .limit(limit);

            return products || [];

        } catch (error) {
            console.error('Category recommendations error:', error);
            return [];
        }
    },

    /**
     * Get popular/trending products
     */
    async getPopularProducts(limit: number): Promise<any[]> {
        try {
            const { data } = await supabase
                .from('products')
                .select('*')
                .order('total_sold', { ascending: false })
                .limit(limit);

            return data || [];
        } catch (error) {
            console.error('Popular products error:', error);
            return [];
        }
    },

    /**
     * Remove duplicate products
     */
    removeDuplicates(products: any[]): any[] {
        const seen = new Set();
        return products.filter(product => {
            if (seen.has(product.id)) {
                return false;
            }
            seen.add(product.id);
            return true;
        });
    },

    /**
     * Shuffle array (Fisher-Yates algorithm)
     */
    shuffleArray(array: any[]): any[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};
