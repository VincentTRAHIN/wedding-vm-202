export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			guests: {
				Row: {
					id: string;
					created_at: string;
					email: string;
					full_name: string | null;
					avatar_url: string | null;
					role: 'admin' | 'guest';
					auth_id: string | null;
					rsvp_status: 'pending' | 'present' | 'absent';
					adults_count: number;
					children_count: number;
					dietary_restrictions: string | null;
					expected_count: number;
				};
				Insert: {
					id?: string;
					created_at?: string;
					email: string;
					full_name?: string | null;
					avatar_url?: string | null;
					role?: 'admin' | 'guest';
					auth_id?: string | null;
					rsvp_status?: 'pending' | 'present' | 'absent';
					adults_count?: number;
					children_count?: number;
					dietary_restrictions?: string | null;
					expected_count?: number;
				};
				Update: {
					id?: string;
					created_at?: string;
					email?: string;
					full_name?: string | null;
					avatar_url?: string | null;
					role?: 'admin' | 'guest';
					auth_id?: string | null;
					rsvp_status?: 'pending' | 'present' | 'absent';
					adults_count?: number;
					children_count?: number;
					dietary_restrictions?: string | null;
					expected_count?: number;
				};
			};
			photos: {
				Row: {
					id: string;
					created_at: string;
					storage_path: string;
					guest_id: string;
					owner_id: string;
					status: 'pending' | 'approved' | 'rejected';
					caption: string | null;
				};
				Insert: {
					id?: string;
					created_at?: string;
					storage_path: string;
					guest_id: string;
					owner_id?: string;
					status?: 'pending' | 'approved' | 'rejected';
					caption?: string | null;
				};
				Update: {
					id?: string;
					created_at?: string;
					storage_path?: string;
					guest_id?: string;
					owner_id?: string;
					status?: 'pending' | 'approved' | 'rejected';
					caption?: string | null;
				};
			};
		};
	};
}
