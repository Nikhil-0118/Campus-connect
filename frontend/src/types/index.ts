// ─── User & Auth ───────────────────────────────────
export interface Department {
  id: number;
  name: string;
  short_name: string;
}

export interface Branch {
  id: number;
  name: string;
  short_name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  bio: string;
  department: number | null;
  department_detail: Department | null;
  branch: number | null;
  branch_detail: Branch | null;
  year: number | null;
  section: string;
  student_id: string | null;
  phone_number: string;
  is_verified_student: boolean;
  is_profile_completed: boolean;
  date_joined: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  department?: number;
  branch?: number;
  year?: number;
  student_id?: string;
}

// ─── Profiles ──────────────────────────────────────

export interface Profile {
  id: number;
  user: User;
  skills: string[];
  interests: string[];
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

// ─── Connections ───────────────────────────────────

export interface ConnectionUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface Connection {
  id: number;
  sender: ConnectionUser;
  receiver: ConnectionUser;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

// ─── Teams ─────────────────────────────────────────

export interface TeamMember {
  id: number;
  user_id: number;
  username: string;
  role: 'creator' | 'member';
  created_at: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  creator: number;
  creator_username: string;
  project_description: string;
  required_skills: string[];
  max_members: number;
  hackathon_name: string;
  status: 'open' | 'closed' | 'completed';
  members: TeamMember[];
  current_member_count: number;
  is_full: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Marketplace ───────────────────────────────────

export type ListingCategory = 'books' | 'notes' | 'electronics' | 'calculators' | 'lab_equipment' | 'college_materials' | 'other';
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type ListingStatus = 'available' | 'sold' | 'reserved';

export interface ListingSeller {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface Listing {
  id: number;
  seller: number;
  seller_detail: ListingSeller;
  title: string;
  description: string;
  category: ListingCategory;
  price: string;
  condition: ListingCondition;
  image: string;
  location: string;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface Interest {
  id: number;
  listing: number;
  buyer: number;
  buyer_username: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
}

// ─── Lost & Found ──────────────────────────────────

export type LostFoundType = 'lost' | 'found';
export type LostFoundCategory = 'electronics' | 'documents' | 'accessories' | 'clothing' | 'books' | 'keys' | 'wallet' | 'other';

export interface LostFoundUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface LostFoundItem {
  id: number;
  user: number;
  user_detail: LostFoundUser;
  item_type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  image: string;
  location: string;
  date: string | null;
  status: 'active' | 'claimed' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface LostFoundMatch {
  item: LostFoundItem;
  score: number;
}

// ─── Events ────────────────────────────────────────

export type EventCategory = 'hackathon' | 'workshop' | 'seminar' | 'cultural' | 'sports' | 'tech' | 'club' | 'other';

export interface EventOrganizer {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  organizer: number;
  organizer_detail: EventOrganizer;
  venue: string;
  date: string;
  start_time: string;
  end_time: string | null;
  image: string;
  category: EventCategory;
  registration_link: string;
  registration_count: number;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: number;
  event: number;
  event_title: string;
  user: number;
  username: string;
  created_at: string;
}

// ─── Notifications ─────────────────────────────────

export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'team_join'
  | 'marketplace_interest'
  | 'lost_found_match'
  | 'event_registration'
  | 'general';

export interface Notification {
  id: number;
  recipient: number;
  sender: number | null;
  sender_username: string | null;
  notification_type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Search ────────────────────────────────────────

export interface SearchResults {
  profiles?: Profile[];
  teams?: Team[];
  listings?: Listing[];
  lost_found?: LostFoundItem[];
  events?: Event[];
}

// ─── Pagination ────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
