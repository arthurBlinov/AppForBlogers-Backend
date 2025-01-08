const blockUser = (user) => {
    if(user?.isBlocked){
        throw new Error(`Access denied, user ${user?.firstName} is blocked`)
    }
}

module.exports = blockUser;