export interface IClientProfile {
  id: number;
    full_name: string;
    profile: {
      user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        date_joined: string;
      };
      phone: string;
      location: string;
      profile_pic: string | null;
      bio: string;
      pay_id: string;
      pay_id_no: string;
      id_card: string;
      device: string;
      user_type: "client" | "freelancer" | "admin";
    };
    company_name: string;
    company_website: string;
    industry: string;
    project_budget: string;
    preferred_freelancer_level: "entry" | "mid" | "expert" | string;
    languages: string[];
    slug: string;
    is_verified: boolean;
    rating: number;
    review_count: number;
    recent_reviews: any[];
}

export interface IClientDashboardMetrics {
  activity: {
    jobs_completed: number;
    jobs_open: number;
  };
  wallet: {
    total_spent: string;
  };
}

// Client Jobs Management Types

export type JobType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary"
  | "freelance"
  | string;

export type JobStatus =
  | "open"
  | "in_progress"
  | "completed"
  | "cancelled"
  | string;

export type PreferredFreelancerLevel = "entry" | "intermediate" | "expert";

export type JobCategory =
  | "data_entry"
  | "translation"
  | "transcription"
  | "graphics"
  | "writing"
  | "web_dev"
  | "project_mgmt"
  | "testing"
  | "virtual_assist"
  | "social_media"
  | "ai_training";

export interface IJobCreatePayload {
  title: string;
  category: string;
  description: string;
  price: string;
  deadline_date: string;
  status?: JobStatus;
  max_freelancers?: number;
  required_freelancers?:number;
  preferred_freelancer_level?: PreferredFreelancerLevel;
  skills_required: string[];
}

export interface IFreelancer {
  id: number;
  username: string;
  full_name: string; 
  profile_pic?: string;
  rating: number;
  recent_reviews: any[];
}

export interface IJob {
  id: number;
  title: string;
  category: { id: number; name: JobCategory };
  category_display: string;
  description: string;
  price: string;
  posted_date: string;
  deadline_date: string;
  status: JobStatus;
  client: string;
  max_freelancers: number;
  required_freelancers:number;
  preferred_freelancer_level: PreferredFreelancerLevel;
  slug: string;
  selected_freelancers: IFreelancer[];
  payment_verified: boolean;
  skills_required_display: { id: number; name: string }[];
  application_count: number;
}

export interface IJobApplication {
  id: number;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_pic?: string | null;
    bio: string;
    location?: string;
  };
  status: "pending" | "accepted" | "rejected" | string;
  bid_amount: string;
  submitted_at: string;
  cv_url: string;
  cover_letter_url: string;
  portfolio_url: string;
}

export interface IWalletSummary {
  current_balance: string;
  total_earned: string;
  total_spent: string;
}

export type WalletTransactionType =
  | "deposit"
  | "withdrawal"
  | "job_payment"
  | "fee"
  | string;

export type WalletTransactionStatus =
  | "in_progress"
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export interface IWalletTransaction {
  id: string;
  job_id: number;
  job_title: string;
  amount: string;
  verified: boolean;
  status: string;
  source: string;
  created_at: string;
}

export interface IInvoiceLineItem {
  id: number;
  description: string;
  quantity: number;
  rate: string;
  amount: string;
}

export interface IInvoice extends IInvoiceCreatePayload {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: string;
  status: string;
  notes: string;
  user_type: "freelancer" | "client";
  line_items: IInvoiceLineItem[];
}

// Client Reviews Types

export interface IReviewCreatePayload {
  recipient: string;
  rating: number;
  comment: string;
}

export interface IReview extends IReviewCreatePayload {
  id: number;
  reviewer: {
    id: number;
    email: string;
    full_name?: string;
    user_type: "client";
    profile_photo_url?: string | null;
  };
  recipient_details: {
    id: number;
    email: string;
    full_name?: string;
    user_type: "freelancer";
    profile_photo_url?: string | null;
  };
  created_at: string;
  updated_at: string;
}

// Client Trainings Types
export interface ITrainingCreatePayload {
  title: string;
  texts: string;
  pdf_document: File | null;
  video_url: string | null;
}
export interface ITraining extends ITrainingCreatePayload {
  id: number;
  url: string;
  job: string;
  client: number;
  slug: string;
  created_at: string;
  updated_at: string;
}
