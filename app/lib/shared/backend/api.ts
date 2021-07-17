/* eslint-disable */
export interface Endpoint<P, R> extends String {}
export interface FieldQueryLocationsReq {}
export interface FieldRejectOrderRes {
  orderID: null | string;
}
export interface RefreshSessionRes {
  session: string;
  user: User;
}
export interface GrantPointsReq {
  uID: null | string;
  activityID: null | string;
}
export interface UserListRes {
  totalNum: number;
  users: User[];
}
export interface CancelToVerifySignUpRes {
  message: string;
}
export interface TestInitDataReq {}
export interface FieldCreateReq {
  name: string;
  location: string;
  coverPicURL: string;
  address: string;
  capacity: number;
  description: string;
  contactWechat: null | string;
  contactInfo: string;
  pictureURLs: string[];
  openSlots: OpenSlot[];
  labels: string[];
  equipments: string[];
  extra: Record<string, string>;
}
export interface Model {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
export interface AddActivityRes {
  activity: Activity;
  message: string;
}
export interface GetMyPointsRes {
  points: number;
}
export interface FieldQueryReq {
  filters: FieldQueryFilters;
  pagination: Pagination;
}
export interface FieldRejectOrderReq {
  fieldID: null | string;
  orderID: null | string;
  reason: string;
}
export interface UserSetAsStaffRes {}
export interface ActivitySignUpListCSVReq {
  id: null | string;
}
export interface FieldQueryProfileReq {
  fieldID: null | string;
}
export interface FieldQueryProfileRes {
  field: Field;
  fieldProfile: FieldProfile;
}
export interface FieldVerifyOrderReq {
  fieldID: null | string;
  orderID: null | string;
}
export interface SwiperGetResp {
  urls: string[];
}
export interface Pagination {
  pageNum?: number;
  pageSize?: number;
  pageCursor?: number;
  totalNum?: number;
}
export interface GrantPointsRes {
  message: string;
}
export interface ToVerifiedSignUpRecordListRes {
  pagination: Pagination;
  records: SignUpRecord[];
}
export interface ActivityBaseInfo {
  id: null | string;
  title: string;
  field: string;
  location: string;
  coverPicUrl: string;
  totalQuota: number;
  applyQuota: number;
  fakeQuota: number;
  begin: Date;
  end: Date;
  signUpBegin: Date;
  signUpEnd: Date;
  labels: ActivityLabel[];
}
export interface AddActivityReq {
  activity: ActivityAllInfo;
}
export interface Introduction {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  name: string;
  content: string;
}
export interface CancelSignUpReq {
  activityID: null | string;
}
export interface FieldUpdateReq {
  id: null | string;
  name: string;
  location: string;
  coverPicURL: string;
  address: string;
  capacity: number;
  description: string;
  contactWechat: null | string;
  contactInfo: string;
  pictureURLs: string[];
  openSlots: OpenSlot[];
  labels: string[];
  equipments: string[];
  extra: Record<string, string>;
}
export interface JoinUs {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  name: string;
  content: string;
}
export interface UserDetailReq {
  id?: null | string;
}
export interface FieldQueryOrdersFilters {
  fieldID?: null | string;
  creatorEq?: null | string;
  isVerifiedEq?: null | boolean;
  beginTime?: null | Date;
  endTime?: null | Date;
}
export interface CancelToVerifySignUpReq {
  userID: null | string;
  activityID: null | string;
}
export interface DeleteActivityReq {
  id: null | string;
}
export interface SignUpActivityReq {
  activityID: null | string;
  form: Record<string, string>;
}
export interface SwiperResp {
  msg: string;
}
export interface GetActivitySignUpListRes {
  pagination: Pagination;
  userInfos: UserInfo[];
}
export interface TestInitDataRes {}
export interface FieldCreateOrderReq {
  fieldID: null | string;
  beginTime: Date;
  endTime: Date;
  name: string;
  comment: string;
}
export interface ActivityProfile {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  activityID: null | string;
  Activity: Activity;
  title: string;
  field: string;
  coverPicUrl: string;
  sponsor: null | string;
  origanizerNumber: string;
  introduction: string;
  pictureUrls: string[];
  extra: Record<string, string>;
}
export interface DeleteActivityRes {
  message: string;
}
export interface SelectActivityByLabelReq {
  label: string;
  pagination: Pagination;
}
export interface UserLoginRes {
  session: string;
  deviceToken: string;
  deviceId: null | string;
  user: User;
}
export interface FieldQueryRes {
  fields: Field[];
  pagination: Pagination;
}
export interface ActivitySignUp {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  User: User;
  UserID: null | string;
  activity: Activity;
  activityId: null | string;
  verifiedAt: null | Date;
  checkinAt: null | Date;
  signUpInfo: Record<string, string>;
}
export interface ModelNonPrimary {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
export interface CancelSignUpRes {
  message: string;
}
export interface FieldLabel {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  name: string;
  fields: Field[];
}
export interface ToVerifiedSignUpRecordListReq {
  activityID: null | string;
  pagination: Pagination;
}
export interface FieldDeleteReq {
  fieldID: null | string;
}
export interface FieldOrder {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  field: Field;
  fieldID: null | string;
  name: string;
  comment: string;
  creatorID: null | string;
  beginTime: Date;
  endTime: Date;
  verifiedAt: null | Date;
  isVerified: boolean;
}
export interface GetActivitySignUpListReq {
  id: null | string;
  pagination: Pagination;
}
export interface FieldEquipment {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  name: string;
  iconPicUrl: string;
  fields: Field[];
}
export interface JoinUsResp {
  msg: string;
}
export interface SignUpActivityRes {
  message: string;
}
export interface UserWechatUpdateProfileReq {
  nickName: string;
  AvatarUrl: string;
  gender: number;
  country: string;
  province: string;
  city: string;
  language: string;
}
export interface GetActivityDetailRes {
  activity: ActivityAllInfo;
  signUpAt: null | Date;
}
export interface UserInfo {
  user: User;
  info: Record<string, string>;
  pointedTime: null | Date;
}
export interface UserLoginReq {
  deviceID: null | string;
  userName: string;
  password: string;
}
export interface Permission {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  name: string;
  title: string;
  description: string;
}
export interface FieldOpenSlot {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  field: Field;
  fieldID: null | string;
  beginHour: number;
  beginMinute: number;
  endHour: number;
  endMinute: number;
}
export interface FieldProfile {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  field: Field;
  fieldID: null | string;
  description: string;
  pictureUrls: string[];
  contactWechat: null | string;
  contactInfo: string;
  extra: Record<string, string>;
}
export interface OpenSlot {
  beginHour: number;
  beginMinute: number;
  endHour: number;
  endMinute: number;
}
export interface FieldQueryFilters {
  nameEq?: null | string;
  locationEq?: null | string;
  labelsContain?: string[];
  equipmentsContain?: string[];
}
export interface Activity {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  totalQuota: number;
  applyQuota: number;
  fakeQuota: number;
  beginTime: Date;
  endTime: Date;
  signUpBegin: Date;
  signUpEnd: Date;
  Participants: ActivitySignUp[];
  labels: ActivityLabel[];
  location: string;
  points: number;
  profile: ActivityProfile;
  userID: null | string;
}
export interface JoinUsReq {
  name: string;
  content: string;
}
export interface IntroductionResp {
  msg: string;
}
export interface Empty {}
export interface UserWechatUpdateProfileResp {}
export interface UserSetCredentialReq {
  userName: string;
  password: string;
}
export interface UserWechatLoginResp {
  session: string;
  deviceToken: string;
  deviceId: null | string;
  user: User;
}
export interface Field {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  name: string;
  location: string;
  coverPicUrl: string;
  address: string;
  capacity: number;
  equipments: FieldEquipment[];
  labels: FieldLabel[];
  openSlots: FieldOpenSlot[];
}
export interface FieldQueryLocationsRes {
  totalNum: number;
  locations: string[];
}
export interface IntroductionGetResp {
  content: Introduction[];
}
export interface GetToVerifyActivitiesReq {}
export interface UserListReq {
  pagination: Pagination;
}
export interface GetLabelListRes {
  totalNum: number;
  labels: string[];
}
export interface JoinUsGetResp {
  content: JoinUs[];
}
export interface UserSignUpActivityReq {}
export interface GetToVerifyActivitiesRes {
  activities: ActivityBaseInfo[];
}
export interface FieldDeleteRes {}
export interface FieldQueryOrdersReq {
  filters: FieldQueryOrdersFilters;
  pagination: Pagination;
}
export interface FieldUpdateRes {
  fieldID: null | string;
}
export interface UpdateActivityByIDRes {
  message: string;
}
export interface GetLabelListReq {}
export interface IntroductionReq {
  name: string;
  content: string;
}
export interface VerifySignUpRes {
  message: string;
}
export interface FieldCreateOrderRes {
  orderID: null | string;
}
export interface SwiperGetReq {}
export interface GetMyPointsReq {}
export interface ActivityListReq {
  location: string;
  begin: null | Date;
  end: null | Date;
  pagination: Pagination;
}
export interface GetActivityDetailReq {
  id: null | string;
}
export interface SignUpRecord {
  userID: null | string;
  activityID: null | string;
  userName: null | string;
  phoneNumber: null | number;
  realName: string;
  nickName: string;
  activity: ActivityBaseInfo;
  signUpTime: Date;
  userInfo: Record<string, string>;
}
export interface UserSignUpActivityRes {
  signUpRecord: ActivitySignUp[];
}
export interface UserDetailRes {
  user: User;
}
export interface UserSetAsStaffReq {
  id?: null | string;
}
export interface UserSetCredentialRes {
  user: User;
}
export interface UserWechatLoginReq {
  deviceId?: null | string;
  code: string;
}
export interface Role {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  parentID: null | string;
  parentRole: Role;
  name: string;
  title: string;
  description: string;
  permissions: Permission[];
}
export interface VerifySignUpReq {
  userID: null | string;
  activityID: null | string;
}
export interface FieldDeleteOrderReq {
  fieldID: null | string;
  orderID: null | string;
}
export interface UpdateActivityByIDReq {
  id: null | string;
  activity: ActivityAllInfo;
}
export interface ActivityAllInfo {
  id: null | string;
  title: string;
  field: string;
  location: string;
  coverPicUrl: string;
  totalQuota: number;
  applyQuota: number;
  fakeQuota: number;
  begin: Date;
  end: Date;
  signUpBegin: Date;
  signUpEnd: Date;
  labels: ActivityLabel[];
  sponsor: null | string;
  origanizerNumber: string;
  introduction: string;
  pictureUrls: string[];
  points: number;
  extra: Record<string, string>;
}
export interface SelectActivityByLabelRes {
  pagination: Pagination;
  activities: ActivityBaseInfo[];
}
export interface RefreshSessionReq {
  deviceToken: string;
}
export interface FieldDeleteOrderRes {
  orderID: null | string;
}
export interface FieldVerifyOrderRes {
  orderID: null | string;
}
export interface SwiperReq {
  urls: string[];
}
export interface ActivityListRes {
  pagination: Pagination;
  activities: ActivityBaseInfo[];
}
export interface ActivityLabel {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  name: string;
  Activities: Activity[];
}
export interface FieldCreateRes {
  fieldID: null | string;
}
export interface FieldQueryOrdersRes {
  fieldOrders: FieldOrder[];
  pagination: Pagination;
}
export interface User {
  id: null | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  userName: null | string;
  phoneNumber: null | number;
  realName: string;
  avatarURI: string;
  nickName: string;
  permissions: Permission[];
  roles: Role[];
  isStaff?: boolean;
  isSuper?: boolean;
  isDisabled: null | boolean;
}
export const home_swiper = {
  SwiperService: {
    SwiperCreate: "home_swiper/SwiperService.SwiperCreate" as Endpoint<
      SwiperReq,
      SwiperResp
    >,
    SwiperGet: "home_swiper/SwiperService.SwiperGet" as Endpoint<
      SwiperGetReq,
      SwiperGetResp
    >,
  },
};
export const introduction = {
  IntroductionService: {
    IntroductionUpdate:
      "introduction/IntroductionService.IntroductionUpdate" as Endpoint<
        IntroductionReq,
        IntroductionResp
      >,
    IntroductionCreate:
      "introduction/IntroductionService.IntroductionCreate" as Endpoint<
        IntroductionReq,
        IntroductionResp
      >,
    IntroductionGet:
      "introduction/IntroductionService.IntroductionGet" as Endpoint<
        IntroductionReq,
        IntroductionGetResp
      >,
  },
};
export const join = {
  JoinUsService: {
    JoinUsUpdate: "join/JoinUsService.JoinUsUpdate" as Endpoint<
      JoinUsReq,
      JoinUsResp
    >,
    JoinUsCreate: "join/JoinUsService.JoinUsCreate" as Endpoint<
      JoinUsReq,
      JoinUsResp
    >,
    JoinUsGet: "join/JoinUsService.JoinUsGet" as Endpoint<
      JoinUsReq,
      JoinUsGetResp
    >,
  },
};
export const points = {
  PointsService: {
    GetMyPoints: "points/PointsService.GetMyPoints" as Endpoint<
      GetMyPointsReq,
      GetMyPointsRes
    >,
  },
};
export const activity = {
  ActivityService: {
    ActivityList: "activity/ActivityService.ActivityList" as Endpoint<
      ActivityListReq,
      ActivityListRes
    >,
    GetActivityDetail: "activity/ActivityService.GetActivityDetail" as Endpoint<
      GetActivityDetailReq,
      GetActivityDetailRes
    >,
    AddActivity: "activity/ActivityService.AddActivity" as Endpoint<
      AddActivityReq,
      AddActivityRes
    >,
    DeleteActivity: "activity/ActivityService.DeleteActivity" as Endpoint<
      DeleteActivityReq,
      DeleteActivityRes
    >,
    SelectActivityByLabel:
      "activity/ActivityService.SelectActivityByLabel" as Endpoint<
        SelectActivityByLabelReq,
        SelectActivityByLabelRes
      >,
    UpdateActivityByID:
      "activity/ActivityService.UpdateActivityByID" as Endpoint<
        UpdateActivityByIDReq,
        UpdateActivityByIDRes
      >,
    GetLabelList: "activity/ActivityService.GetLabelList" as Endpoint<
      GetLabelListReq,
      GetLabelListRes
    >,
    GrantPoints: "activity/ActivityService.GrantPoints" as Endpoint<
      GrantPointsReq,
      GrantPointsRes
    >,
  },
  SignUpService: {
    SignUpActivity: "activity/SignUpService.SignUpActivity" as Endpoint<
      SignUpActivityReq,
      SignUpActivityRes
    >,
    CancelSignUp: "activity/SignUpService.CancelSignUp" as Endpoint<
      CancelSignUpReq,
      CancelSignUpRes
    >,
    CancelToVerifySignUp:
      "activity/SignUpService.CancelToVerifySignUp" as Endpoint<
        CancelToVerifySignUpReq,
        CancelToVerifySignUpRes
      >,
    VerifySignUp: "activity/SignUpService.VerifySignUp" as Endpoint<
      VerifySignUpReq,
      VerifySignUpRes
    >,
    GetActivitySignUpList:
      "activity/SignUpService.GetActivitySignUpList" as Endpoint<
        GetActivitySignUpListReq,
        GetActivitySignUpListRes
      >,
    ToVerifiedSignUpRecordList:
      "activity/SignUpService.ToVerifiedSignUpRecordList" as Endpoint<
        ToVerifiedSignUpRecordListReq,
        ToVerifiedSignUpRecordListRes
      >,
    ActivitySignUpCSVList:
      "activity/SignUpService.ActivitySignUpCSVList" as Endpoint<
        ActivitySignUpListCSVReq,
        Empty
      >,
    UserSignUpActivity: "activity/SignUpService.UserSignUpActivity" as Endpoint<
      UserSignUpActivityReq,
      UserSignUpActivityRes
    >,
    GetToVerifyActivities:
      "activity/SignUpService.GetToVerifyActivities" as Endpoint<
        GetToVerifyActivitiesReq,
        GetToVerifyActivitiesRes
      >,
  },
};
export const auth = {
  UserService: {
    UserDetail: "auth/UserService.UserDetail" as Endpoint<
      UserDetailReq,
      UserDetailRes
    >,
    List: "auth/UserService.List" as Endpoint<UserListReq, UserListRes>,
    Login: "auth/UserService.Login" as Endpoint<UserLoginReq, UserLoginRes>,
    RefreshSession: "auth/UserService.RefreshSession" as Endpoint<
      RefreshSessionReq,
      RefreshSessionRes
    >,
    UserSetAsStaff: "auth/UserService.UserSetAsStaff" as Endpoint<
      UserSetAsStaffReq,
      UserSetAsStaffRes
    >,
    SetCredential: "auth/UserService.SetCredential" as Endpoint<
      UserSetCredentialReq,
      UserSetCredentialRes
    >,
    WechatLogin: "auth/UserService.WechatLogin" as Endpoint<
      UserWechatLoginReq,
      UserWechatLoginResp
    >,
    WechatUpdateProfile: "auth/UserService.WechatUpdateProfile" as Endpoint<
      UserWechatUpdateProfileReq,
      UserWechatUpdateProfileResp
    >,
  },
};
export const field = {
  FieldService: {
    TestInitData: "field/FieldService.TestInitData" as Endpoint<
      TestInitDataReq,
      TestInitDataRes
    >,
    Create: "field/FieldService.Create" as Endpoint<
      FieldCreateReq,
      FieldCreateRes
    >,
    CreateOrder: "field/FieldService.CreateOrder" as Endpoint<
      FieldCreateOrderReq,
      FieldCreateOrderRes
    >,
    Delete: "field/FieldService.Delete" as Endpoint<
      FieldDeleteReq,
      FieldDeleteRes
    >,
    DeleteOrder: "field/FieldService.DeleteOrder" as Endpoint<
      FieldDeleteOrderReq,
      FieldDeleteOrderRes
    >,
    Query: "field/FieldService.Query" as Endpoint<FieldQueryReq, FieldQueryRes>,
    QueryLocations: "field/FieldService.QueryLocations" as Endpoint<
      FieldQueryLocationsReq,
      FieldQueryLocationsRes
    >,
    QueryOrders: "field/FieldService.QueryOrders" as Endpoint<
      FieldQueryOrdersReq,
      FieldQueryOrdersRes
    >,
    QueryProfile: "field/FieldService.QueryProfile" as Endpoint<
      FieldQueryProfileReq,
      FieldQueryProfileRes
    >,
    RejectOrder: "field/FieldService.RejectOrder" as Endpoint<
      FieldRejectOrderReq,
      FieldRejectOrderRes
    >,
    Update: "field/FieldService.Update" as Endpoint<
      FieldUpdateReq,
      FieldUpdateRes
    >,
    VerifyOrder: "field/FieldService.VerifyOrder" as Endpoint<
      FieldVerifyOrderReq,
      FieldVerifyOrderRes
    >,
  },
};
