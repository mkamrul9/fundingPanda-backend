export type TUpdateProjectStatus = {
    status: 'APPROVED' | 'DRAFT';
    adminFeedback?: string;
};

export type TVerifyUser = {
    isVerified: boolean;
};

export type TToggleUserBan = {
    isBanned: boolean;
};