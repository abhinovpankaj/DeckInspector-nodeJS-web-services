"use strict";
const TenantDAO = require("../model/tenantsDAO");

var addTenant = async function (tenant) {
  try {
    const result = await TenantDAO.addTenant(tenant);
    //Umesh TODO : think about whether we want service layer to know about underlying DB technology
    if (result.insertedId) {      
      return {
        success: true,
        id: result.insertedId,
      };
    }
    return {
      code: 500,
      success: false,
      reason: "Insertion failed",
    };
  } catch (error) {
    return handleError(error);
  }
};

var getTenantById = async function (tenantId) {
  try {
    const result = await TenantDAO.getTenantById(tenantId);
    if (result) {
      return {
        success: true,
        Tenant: result,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID",
    };
  } catch (error) {
    return handleError(error);
  }
};
var deleteTenantPermanently = async function (tenantId) {
  try {
    const result = await TenantDAO.deleteTenantPermanently(tenantId);
    if (result.deletedCount === 1) {
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID",
    };
  } catch (error) {
    return handleError(error);
  }
};
var getAllTenants = async function () {
  try {
    const result = await TenantDAO.getAllTenants();
    if (result) {
      return {
        success: true,
        Tenants: result,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found",
    };
  } catch (error) {
    return handleError(error);
  }
};

var editTenant = async function (tenantId, newData) {
  try {
    const result = await TenantDAO.editTenant(tenantId, newData);
    if (result.modifiedCount === 1) {
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID",
    };
  } catch (error) {
    return handleError(error);
  }
};

var addDiskSpace = async function (tenantId, space) {
  try {
    const result = await TenantDAO.addTenantDiskSpace(tenantId, space);
    if (result.modifiedCount === 1) {
      return {
        success: true,     
      };
    }
    return {
      code: 401,
      success: false,
      reason: "failed to add space to give tenant/or tenant not found.",
    };
  } catch (error) {
    return handleError(error);
  }
};
var addUsedDiskSpace = async function (tenantId, space) {
  try {
    const result = await TenantDAO.addTenantUsedDiskSpace(tenantId, space);
    if (result.modifiedCount === 1) {
      return {
        success: true,     
      };
    }
    return {
      code: 401,
      success: false,
      reason: "failed to add space to give tenant/or tenant not found.",
    };
  } catch (error) {
    return handleError(error);
  }
};
var increaseTenantValidity = async function (tenantId, days) {
  try {
    const result = await TenantDAO.increaseTenantValidity(tenantId, days);
    if (result.modifiedCount === 1) {
      return {
        success: true,     
      };
    }
    return {
      code: 401,
      success: false,
      reason: "failed to add days to validity/or tenant not found.",
    };
  } catch (error) {
    return handleError(error);
  }
};
var increaseTenantUsers = async function (tenantId, count) {
  try {
    const result = await TenantDAO.increaseTenantUsers(tenantId, count);
    if (result.modifiedCount === 1) {
      return {
        success: true,     
      };
    }
    return {
      code: 401,
      success: false,
      reason: "failed to increase users  to validity/or tenant not found.",
    };
  } catch (error) {
    return handleError(error);
  }
};
var toggleAccessForTenant = async function (tenantId, isActive) {
  try {
    const result = await TenantDAO.toggleTenantAccess(
      tenantId,
      isActive
    );
    if (result.modifiedCount === 1) {
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID/failed to update.",
    };
  } catch (error) {
    return handleError(error);
  }
};

var addUpdateAdmin = async function (tenantId, adminDetails) {
  try {
    const result = await TenantDAO.updateAdminDetails(
      tenantId,
      adminDetails
    );
    if (result.modifiedCount === 1) {
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID/failed to update.",
    };
  } catch (error) {
    return handleError(error);
  }
};

var updateAddIconsForTenant = async function (tenantId, iconsData) {
  try {
    const result = await TenantDAO.updateAddIconsForTenant(
      tenantId,
      iconsData
    );
    if (result.modifiedCount === 1) {
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID/failed to update.",
    };
  } catch (error) {
    return handleError(error);
  }
};

var updateTenantsAzureStorageDataDetails = async function (tenantId, azureStorageDetails) {
  try {
    const result = await TenantDAO.updateTenantsAzureStorageDataDetails(
      tenantId,
      azureStorageDetails
    );
    if (result.modifiedCount === 1) {
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID/failed to update.",
    };
  } catch (error) {
    return handleError(error);
  }
};
var updateLogoURL = async function (tenantId, logoURL) {
  try {
    const result = await TenantDAO.updateTenantLogo(
      tenantId,
      logoURL
    );
    if (result.modifiedCount === 1) {
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID/failed to update.",
    };
  } catch (error) {
    return handleError(error);
  }
};
var updateTenantWebsite = async function (tenantId, website) {
  try {
    const result = await TenantDAO.updateTenantWebsite(
      tenantId,
      website
    );
    if (result.modifiedCount === 1) {
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID/failed to update.",
    };
  } catch (error) {
    return handleError(error);
  }
};

var updateValidityDate = async function (tenantId, endDate) {
  try {
    const result = await TenantDAO.updateEndDate(
      tenantId,
      endDate
    );
    if (result.modifiedCount === 1) {
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID/failed to update.",
    };
  } catch (error) {
    return handleError(error);
  }
};

var updateTenantExpenses = async function (tenantId, expense) {
  try {
    const result = await TenantDAO.updateTenantExpenses(
      tenantId,
      expense
    );
    if (result.modifiedCount === 1) {
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID/failed to update.",
    };
  } catch (error) {
    return handleError(error);
  }
};
var getDiskWarning = async function(tenantId){
  try {
    const result = await TenantDAO.diskLimitreaching(tenantId);
    if (result) {
      return {
        success: true,
        limitreaching:result.isLimitreaching
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Tenant found with the given ID/failed to get data.",
    };
  } catch (error) {
    return handleError(error);
  }
};




const handleError = (error) => {
  console.error("An error occurred:", error);
  return {
    code: 500,
    success: false,
    reason: `An error occurred: ${error.message}`,
  };
};

module.exports = {
  addTenant,
  getTenantById,
  getDiskWarning,
  deleteTenantPermanently,
  getAllTenants,
  editTenant,
  toggleAccessForTenant,
  addDiskSpace,
  increaseTenantValidity,
  increaseTenantUsers,
  updateAddIconsForTenant,
  updateTenantsAzureStorageDataDetails,
  updateLogoURL,
  updateTenantWebsite,
  updateTenantExpenses,
  addUsedDiskSpace,
  updateValidityDate,
  addUpdateAdmin
};
