const getUserRoles = (roles) => {
  const isMaker = roles.includes('maker');
  const isChecker = roles.includes('checker');
  // TODO DTFS2-6624 Remove is read-only if it serves no use
  const isReadOnly = roles.includes('read-only')
  const isReadOnlyForMaker = roles.includes('read-only') && !roles.includes('maker') 
  const isReadOnlyForChecker =  roles.includes('read-only') && !roles.includes('checker')
  
  return {
    isMaker,
    isChecker,
    isReadOnly,
    isReadOnlyForMaker,
    isReadOnlyForChecker,
  };
};

module.exports = getUserRoles;
