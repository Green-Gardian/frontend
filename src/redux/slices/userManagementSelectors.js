
export const selectUserManagementState = (state) => state.authSlice;

export const selectUserList = (state) => selectUserManagementState(state).users || [];

export const selectUserStats = (state) => selectUserManagementState(state).stats || null;


