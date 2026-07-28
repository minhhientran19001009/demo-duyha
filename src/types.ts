export interface Image360 {
    title: string;
    url: string;
    type?: 'url' | 'upload';
}

export interface Official {
    id: number;
    name: string;
    role: string;
    phone: string;
    place_id?: number;
    neighborhood_name?: string;
    avatar_color?: string;
    avatar?: string;
    department?: 'dang_uy' | 'chinh_quyen' | 'ttpvhcc' | 'cskv' | 'cong_an';
}

export interface Place {
    id: number;
    name: string;
    category: 'government' | 'neighborhood' | 'school' | 'health' | 'police' | 'meritorious_family';
    status: 'active' | 'closed';
    address?: string;
    lat: number;
    lng: number;
    image?: string | null;
    administrative_unit_id?: number;
    description?: string;
    hours?: string;
    households?: number;
    population?: number;
    former_names?: string;
    cultural_house_address?: string;
    images_360?: Image360[];
    officials?: Official[];
}

export interface AdminUnit {
    id: number;
    code: string;
    name: string;
    type: string;
    lat: number;
    lng: number;
    district_name?: string | null;
}

export interface Province {
    code: string;
    name: string;
    full_name: string;
    latitude: number | null;
    longitude: number | null;
}

export interface Neighborhood {
    id: number;
    name: string;
    type: 'old' | 'new';
    group_code: string;
    leader_name: string | null;
    leader_phone: string | null;
    households: number;
    people: number;
    area_ha?: number;
    status?: string;
}

export interface MeritoriousFamily {
    id: number;
    name: string;
    representative_name: string;
    type: string;
    neighborhood_id?: number | null;
    celebration_event_id?: number | null;
    phone: string;
    address: string;
    status: string;
    benefit_details: string;
    description?: string;
    householder_name?: string;
    merit_title?: string;
    reward_level?: string;
    relative_contact?: string;
}

export interface CelebrationEvent {
    id: number;
    name: string;
    day: number;
    month: number;
    description: string;
    status: string;
    title?: string;
    message?: string;
    is_active?: boolean;
}

export interface PortalStats {
    totalPlaces: number;
    totalNeighborhoods: number;
    totalHouseholds: number;
    totalPopulation: number;
    naturalArea: string;
    totalVrScenes: number;
}

