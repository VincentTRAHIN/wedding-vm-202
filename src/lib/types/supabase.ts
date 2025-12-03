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
					managed_by_id: string | null;
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
					managed_by_id?: string | null;
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
					managed_by_id?: string | null;
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
			photo_likes: {
				Row: {
					user_id: string;
					photo_id: string;
					created_at: string;
				};
				Insert: {
					user_id: string;
					photo_id: string;
					created_at?: string;
				};
				Update: {
					user_id?: string;
					photo_id?: string;
					created_at?: string;
				};
			};
			photo_comments: {
				Row: {
					id: string;
					photo_id: string;
					user_id: string;
					content: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					photo_id: string;
					user_id: string;
					content: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					photo_id?: string;
					user_id?: string;
					content?: string;
					created_at?: string;
				};
			};
		};
	};
}
