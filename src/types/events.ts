export enum PUSHER_CLIENT_EVENT {
  MESSAGE = "client-message",
  START_TYPING = "client-start-typing",
  STOP_TYPING = "client-stop-typing",
}

export enum PUSHER_EVENT {
  SUBSCRIPTION_SUCCEEDED = "pusher:subscription_succeeded",
  SUBSCRIPTION_ERROR = "pusher:subscription_error",
}

export enum PUSHER_PRESSENCE_EVENT {
  MEMBER_ADDED = "pusher:member_added",
  MEMBER_REMOVED = "pusher:member_removed",
}
