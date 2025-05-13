import axios from 'axios';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid';

// Types for configuration and responses
interface QuarksConfig {
    baseUrl: string;
    appId: string;
}

interface FilterCondition {
    eq?: any;
    eq_any?: any[];
    gt?: any;
    lt?: any;
    gte?: any;
    lte?: any;
}

interface WhereCondition {
    [field: string]: FilterCondition;
}

interface FilterOptions {
    where?: WhereCondition | {
        or?: WhereCondition[];
        and?: WhereCondition[];
    };
}

interface QueryOptions {
    skip?: number;
    limit?: number;
    sortBy?: string;
    sortDesc?: boolean;
    where?: WhereCondition | {
        or?: WhereCondition[];
        and?: WhereCondition[];
    };
}

interface SearchJsonInclude {
    map: {
        field: string;
        as: string;
    };
    module?: string;
    filter?: string;
    params?: string;
}

interface SearchJsonOptions {
    keys: string;
    include: SearchJsonInclude;
    skip?: number;
    limit?: number;
}

interface FuzzySearchItem {
    word: string;
    tag?: string;
    meta?: string;
}

interface FuzzySearchUpdateItem extends FuzzySearchItem {
    oldword: string;
}

interface FuzzySearchQuery {
    word: string;
    maxedits?: number;
}

// Helper functions for ID generation
const generateId = (size: number = 20): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < size; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

const generateSnowflakeId = (): string => {
    const timestamp = Date.now();
    const machineId = uuidv4().slice(0, 6);
    const sequence = generateId(6);
    return `${timestamp}-${machineId}-${sequence}`;
};

// Main Quarks Client Class
class QuarksClient {
    private baseUrl: string;
    private appId: string;

    constructor(config: QuarksConfig) {
        this.baseUrl = config.baseUrl;
        this.appId = config.appId;
    }

    private addPrefixToWord(word: string): string {
        return `${this.appId}:${word}`;
    }

    private async request(endpoint: string, method: 'GET' | 'POST' | 'DELETE', body?: any) {
        const url = `${this.baseUrl}${endpoint}`;
        try {
            const response = await axios({
                method,
                url,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: body,
            });

            return response.data;
        } catch (error: any) {
            console.error('API Request Error:', error.message);
            throw error;
        }
    }

    async put(key: string, value: any): Promise<void> {
        await this.request('/putjson', 'POST', { key, value });
    }

    async get(key: string): Promise<any> {
        return this.request('/getjson', 'POST', { key });
    }

    async query(prefix: string, options: QueryOptions = {}): Promise<any[]> {
        const { skip = 0, limit = 50, sortBy, sortDesc, where } = options;
        let endpoint = `/getsorted?keys=${prefix}*&skip=${skip}&limit=${limit}`;

        if (where) {
            const filter = { where };
            endpoint += `&filter=${encodeURIComponent(JSON.stringify(filter))}`;
        }
        if (sortBy) endpoint += `&sortby=${sortBy}&des=${sortDesc}`;

        const response = await this.request(endpoint, 'GET');
        return response.result.map((item: any) => item.value);
    }

    async remove(key: string): Promise<void> {
        await this.request(`/remove?key=${key}`, 'GET');
    }

    async increment(key: string, field: string, value: number): Promise<void> {
        await this.request('/incrval', 'POST', {
            key,
            value: { [field]: value },
        });
    }

    async searchJson(options: SearchJsonOptions): Promise<any[]> {
        return this.request('/searchjson', 'POST', options);
    }

    async deleteFuzzyWord(item: FuzzySearchItem): Promise<{ result: boolean }> {
        const prefixedItem = { ...item, word: this.addPrefixToWord(item.word) };
        return this.request('/fuzzy/delete', 'DELETE', prefixedItem);
    }

    async updateFuzzyWord(item: FuzzySearchUpdateItem): Promise<{ result: boolean }> {
        const prefixedItem = {
            ...item,
            oldword: this.addPrefixToWord(item.oldword),
            word: this.addPrefixToWord(item.word),
        };
        return this.request('/fuzzy/update', 'POST', prefixedItem);
    }

    async insertFuzzyWord(item: FuzzySearchItem): Promise<{ result: boolean }> {
        const prefixedItem = { ...item, word: this.addPrefixToWord(item.word) };
        return this.request('/fuzzy/insert', 'POST', prefixedItem);
    }

    async searchFuzzyWord(query: FuzzySearchQuery): Promise<any> {
        const prefixedQuery = { ...query, word: this.addPrefixToWord(query.word) };
        return this.request('/fuzzy/prefix', 'POST', prefixedQuery);
    }
}

export const fetchPostById = async (postId: string) => {
    const API_BASE_URL = 'https://proxy.hostakkhor.com/proxy';
    const url = `${API_BASE_URL}/getsorted?keys=hostakkhor_posts_${postId}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const data = await response.json();
      return data.result?.[0]?.value || null;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      return null;
    }
  };

export const updatePostById = async (postId: string) => {
    const API_BASE_URL = 'https://proxy.hostakkhor.com/proxy';
    const url = `${API_BASE_URL}/getsorted?keys=hostakkhor_posts_${postId}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const data = await response.json();
      return data.result?.[0]?.value || null;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      return null;
    }
  };

// Export the client creator function
export const createClient = (config: QuarksConfig) => new QuarksClient(config);

// Export types
export type {
    QuarksConfig,
    FilterCondition,
    FilterOptions,
    QueryOptions,
    FuzzySearchItem,
    FuzzySearchQuery,
};