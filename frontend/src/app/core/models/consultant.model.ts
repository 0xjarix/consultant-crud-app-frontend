export interface Consultant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  expertise: string;
  age: number;
}

export type CreateConsultantRequest = Omit<Consultant, 'id'>;

export interface UpdateConsultantRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  expertise?: string;
  age?: number;
}
