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
					room_id: string | null;
					check_in_date: string | null;
					check_out_date: string | null;
					room_notes: string | null;
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
					room_id?: string | null;
					check_in_date?: string | null;
					check_out_date?: string | null;
					room_notes?: string | null;
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
					room_id?: string | null;
					check_in_date?: string | null;
					check_out_date?: string | null;
					room_notes?: string | null;
				};
				Relationships: [];
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
				Relationships: [];
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
				Relationships: [];
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
				Relationships: [];
			};
			site_content: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					key: string;
					content: Json;
					page: string | null;
				};
				Insert: {
					id?: string;
					created_at?: string;
					updated_at?: string;
					key: string;
					content: Json;
					page?: string | null;
				};
				Update: {
					id?: string;
					created_at?: string;
					updated_at?: string;
					key?: string;
					content?: Json;
					page?: string | null;
				};
				Relationships: [];
			};
			rooms: {
				Row: {
					id: string;
					created_at: string;
					name: string;
					lol_region: string | null;
					description: string | null;
					capacity: number;
					price_per_night: number | null;
					building: string | null;
					amenities: Json | null;
					image_url: string | null;
					access_code: string | null;
				};
				Insert: {
					id?: string;
					created_at?: string;
					name: string;
					lol_region?: string | null;
					description?: string | null;
					capacity?: number;
					price_per_night?: number | null;
					building?: string | null;
					amenities?: Json | null;
					image_url?: string | null;
					access_code?: string | null;
				};
				Update: {
					id?: string;
					created_at?: string;
					name?: string;
					lol_region?: string | null;
					description?: string | null;
					capacity?: number;
					price_per_night?: number | null;
					building?: string | null;
					amenities?: Json | null;
					image_url?: string | null;
					access_code?: string | null;
				};
				Relationships: [];
			};
			song_requests: {
				Row: {
					id: string;
					created_at: string;
					track_name: string;
					artist: string | null;
					requested_by: string;
				};
				Insert: {
					id?: string;
					created_at?: string;
					track_name: string;
					artist?: string | null;
					requested_by: string;
				};
				Update: {
					id?: string;
					created_at?: string;
					track_name?: string;
					artist?: string | null;
					requested_by?: string;
				};
				Relationships: [];
			};
		};
		Views: { [_ in never]: never };
		Functions: { [_ in never]: never };
		Enums: { [_ in never]: never };
		CompositeTypes: { [_ in never]: never };
	};
}
