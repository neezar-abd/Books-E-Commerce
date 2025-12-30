import { supabase } from './supabase';

export interface Province {
    id: number;
    name: string;
}

export interface City {
    id: number;
    province_id: number;
    name: string;
}

export const regionsService = {
    // Fetch all provinces
    async getProvinces(): Promise<Province[]> {
        const { data, error } = await supabase
            .from('provinces')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching provinces:', error);
            return [];
        }

        return data || [];
    },

    // Fetch cities by province ID
    async getCitiesByProvince(provinceId: number): Promise<City[]> {
        const { data, error } = await supabase
            .from('cities')
            .select('*')
            .eq('province_id', provinceId)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching cities:', error);
            return [];
        }

        return data || [];
    },

    // Get province by name (for existing data)
    async getProvinceByName(name: string): Promise<Province | null> {
        const { data, error } = await supabase
            .from('provinces')
            .select('*')
            .ilike('name', `%${name}%`)
            .single();

        if (error) return null;
        return data;
    },

    // Get city by name within a province
    async getCityByName(name: string, provinceId?: number): Promise<City | null> {
        let query = supabase
            .from('cities')
            .select('*')
            .ilike('name', `%${name}%`);

        if (provinceId) {
            query = query.eq('province_id', provinceId);
        }

        const { data, error } = await query.limit(1).single();

        if (error) return null;
        return data;
    }
};
