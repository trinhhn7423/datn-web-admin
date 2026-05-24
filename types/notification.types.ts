export interface NotificationDto {
  id: string;
  title: string;
  content: string;
  type: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  statusCode: number;
  message: string;
  data: NotificationDto[];
  totalElement: number;
}

export interface NotificationUnreadCountResponse {
  statusCode: number;
  message: string;
  data: {
    count: number;
  };
}

export interface BaseApiResponse {
  statusCode: number;
  message: string;
  data: any;
}
