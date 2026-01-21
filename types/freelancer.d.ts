
export interface IFreelancerProfileCreatePayload {
  profile_picture: string | null;
  bio: string;
  hourly_rate: string;
  country: string;
  city: string;
  address: string;
  postal_code: string;
  phone_number: string;
  skills: number[];
  languages: number[];
  portfolio_links: string[];
}

export interface IFreelancerProfileUpdatePayload {
  phone: string;
  location: string;
  profile_picture: string;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  availability: "full_time" | "part_time" | "custom" | "not_available";
  skills: string[];
  languages: string[];
  is_visible: boolean;
  portfolio_link: string;
}

export interface IFreelancerProfile {
  profile: {
    user: User;
    phone: string;
    location: string;
    profile_pic: string | null;
    bio: string;
    pay_id: string;
    pay_id_no: string;
    id_card: string;
    device: string;
    user_type: "client" | "freelancer";
  };
  id: number;
  full_name: string;
  profile: Profile;
  experience_years: number;
  hourly_rate: string;
  portfolio_link: string;
  availability: "full_time" | "part_time" | "hourly" | "as_needed";
  languages: any[];
  skills: any[];
  is_visible: boolean;
  slug: string;
  rating: number;
  review_count: number;
  recent_reviews: any[];
  portfolio_projects: any[];
}

export interface IFreelancerJobListing {
  id: number;
  title: string;
  category: JobCategory;
  category_display: string;
  description: string;
  price: string;
  posted_date: string;
  deadline_date: string;
  status: JobStatus;
  max_freelancers: number;
  required_freelancers: number;
  preferred_freelancer_level: PreferredFreelancerLevel;
  slug: string;
  selected_freelancer: string | null;
  payment_verified: boolean;
  responses: Array<{
    id: number;
    user: string;
    submitted_at: string;
    extra_data: any | null;
  }>;
  client: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    location: "";
    profile_pic: string | null;
    total_amount_paid: number;
    total_freelancers_hired: number;
    date_joined: string;
  };
  skills_required_display: { id: number; name: string }[];
  client_rating: number;
  client_review_count: number;
  current_applications_count;
  bookmarked: boolean;
  has_applied: boolean;
}

export interface IFreelancerJobApplication {
  id: number;
  job: number;
  job_title: string;
  freelancer: number;
  status: "pending" | "accepted" | "rejected" | string;
  cover_letter: string;
  bid_amount: string;
  created_at: string;
  updated_at: string;
}

export interface IJobApplicationCreatePayload {
  cover_letter: File | null;
  cv: File | null;
  portfolio: File[] | null;
}

export interface IFreelancerJobApplication {
  id: number;
  job: number;
  job_title: string;
  freelancer: number;
  status: "pending" | "accepted" | "rejected" | string;
  cover_letter: string;
  bid_amount: string;
  created_at: string;
  updated_at: string;
}

// Freelancer Wallet & Earnings Types

export interface IFreelancerWalletSummary {
  current_balance: string;
  total_earned: string;
  total_spent: string;
}

export interface IFreelancerWalletTransaction {
  id: number;
  user: number;

  transaction_type:
  | "job_picked"
  | "payment_received"
  | "payment_processing"
  | string;

  amount: string;
  gross_amount: string;
  rate: number;

  status: "in_progress" | "completed" | "failed" | string;

  job: number | null;
  job_title: string | null;

  payment_period?: string;

  timestamp: string;
  completed: boolean;

  extra_data: {
    reference?: string;
    transfer_code?: string;
    currency?: string;
    status?: string;
    [key: string]: any;
  };

  net_earning?: number;
}


export interface IContactFormPayload {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  contact_type: "general" | "support" | "billing" | string
  attachment?: string

}


// Freelancer Reviews (Received) Types
export type IFreelancerReceivedReview = IReview;
export type IFreelancerReviewClientPayload = IReviewCreatePayload;

export type IFreelancerTraining = ITraining;
