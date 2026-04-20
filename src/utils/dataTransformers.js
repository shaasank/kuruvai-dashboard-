import { isValid, format } from 'date-fns';

export const processData = ({ active = [], deleted = [] }) => {
  const rawData = active || [];
  const deletedData = deleted || [];
  
  if (!rawData || rawData.length === 0) return { farmers: [], stats: {}, charts: { remarksData: [], rejectedByRemark: [] } };

  let totalFarmers = 0;
  let totalAcres = 0;
  let totalYield = 0;
  let activeFields = 0;

  const talukYield = {};
  const assignedToStats = {};
  const procurementStatuses = {};
  const remarksCount = {};

  let confirmedCount = 0;
  let notConfirmedCount = 0;
  let sownCount = 0;
  let notSownCount = 0;
  let transplantCount = 0;
  let harvestedCount = 0;
  let rejectedCount = 0;

  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Date-based tracker for "Day-by-Day Tracking"
  // Format: { '2024-06-15': [ { farmer: '...', activity: 'Weedicide', ... } ] }
  const calendarActivities = {};

  const cleanNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const addActivity = (dateStr, farmerName, village, activityName, status) => {
    if (!dateStr) return;
    
    // We only care if it's a valid string date yyyy-mm-dd
    const parsed = new Date(dateStr);
    if (!isValid(parsed)) return;
    
    const formattedDate = format(parsed, 'yyyy-MM-dd');
    if (!calendarActivities[formattedDate]) {
      calendarActivities[formattedDate] = [];
    }
    calendarActivities[formattedDate].push({
      farmerName,
      village,
      activity: activityName,
      status
    });
  };

  const formattedFarmers = rawData.map(f => {
    // Robust key mapping from live sheets to application standards
    const norm = {
      FarmerName: f['Farmer name'] || f['Farmer Name'] || 'Unknown Farmer',
      Village: f['Village'] || 'Unknown',
      Taluk: f['Taluk'] || 'Unknown',
      Acre: cleanNumber(f['Acre']),
      ExpectedYield: cleanNumber(f['Expected Qnty (In MT)'] || f['Expected Quantity (MT)']),
      AssignedTo: f['Assingned to'] || f['Assigned to'] || f['Assigned To'] || 'Unassigned',
      ProcurementStatus: f['Procurement status'] || f['Procurement Status'] || 'Unknown',
      Confirm: f['Confirm'] || '',
      Heritage: f['Heritage'] || 0,
      PurchasedYear: f['Purchased year'] || f['Purchased Year'] || 'Nil',
      Status: f['Status'] || 'Inactive',
      ToBeConfirmedOn: f['To be confirmed on'] || f['To Be Confirmed On'] || '',
      SeedCompany: f['Seed company'] || f['Seed Company'] || '',
      SowingDate: f['Sowing date'] || f['Sowing Date'] || '',
      DirectSowing: f['Direct sowing / Transplant'] || f['Direct Sowing / Transplant'] || '',
      TransplantDate: f['Transplant Date'] || f['Transplant date'] || '',
      Weedicide: f['Weedicide'] || '',
      Date: f['Date'] || '',
      Dose1: f['1st dose'] || f['1st Dose Date'] || '',
      Dose2: f['2nd dose'] || f['2nd Dose Date'] || '',
      Dose3: f['3rd dose'] || f['3rd Dose Date'] || '',
      PlantProtection: f['Plant protection'] || f['Plant Protection'] || '',
      ExpectedHarvestDate: f['Expected harvest date'] || f['Expected Harvest Date'] || '',
      Remarks: f['Remarks'] || f['remarks'] || ''
    };

    totalFarmers++;
    totalAcres += norm.Acre;
    totalYield += norm.ExpectedYield;
    
    if (norm.Status.toLowerCase().includes('active') || norm.Status.toLowerCase() === 'confirmed') {
      activeFields++;
    }

    // New specific KPIs tracking
    if (norm.Confirm.toLowerCase() === 'yes') confirmedCount++;
    else notConfirmedCount++;

    if (norm.SowingDate && norm.SowingDate.toLowerCase() !== 'tbd') sownCount++;
    else notSownCount++;

    if (norm.TransplantDate && norm.TransplantDate.toLowerCase() !== 'tbd') transplantCount++;

    // Assume harvest is done if procurement is made OR the harvest date is strictly in the past
    const isHarvested = norm.ProcurementStatus.toLowerCase().includes('procured') || 
                       norm.ProcurementStatus.toLowerCase().includes('sold') ||
                       (norm.ExpectedHarvestDate && new Date(norm.ExpectedHarvestDate) < today);
    if (isHarvested) harvestedCount++;

    if (norm.ProcurementStatus.toLowerCase().includes('fail') || 
        norm.ProcurementStatus.toLowerCase().includes('reject') || 
        norm.ProcurementStatus.toLowerCase().includes('not purchased')) {
      rejectedCount++;
    }

    // Aggregations mapping
    talukYield[norm.Taluk] = (talukYield[norm.Taluk] || 0) + norm.ExpectedYield;
    
    // Supervisor Comparative Stats
    if (!assignedToStats[norm.AssignedTo]) {
      assignedToStats[norm.AssignedTo] = { farmers: 0, acres: 0, yield: 0 };
    }
    assignedToStats[norm.AssignedTo].farmers += 1;
    assignedToStats[norm.AssignedTo].acres += norm.Acre;
    assignedToStats[norm.AssignedTo].yield += norm.ExpectedYield;

    // Procurement Statuses (Only New, Not purchased, Procured by svastha)
    const pStatusLower = norm.ProcurementStatus.toLowerCase();
    let standardizedProcStatus = "Other";
    if (pStatusLower.includes('new')) standardizedProcStatus = "New";
    else if (pStatusLower.includes('not purchased')) standardizedProcStatus = "Not purchased";
    else if (pStatusLower.includes('procured by svastha')) standardizedProcStatus = "Procured by svastha";

    if (standardizedProcStatus !== "Other") {
      procurementStatuses[standardizedProcStatus] = (procurementStatuses[standardizedProcStatus] || 0) + 1;
    }

    // Track Activities
    addActivity(norm.SowingDate, norm.FarmerName, norm.Village, 'Sowing', norm.Status);
    addActivity(norm.TransplantDate, norm.FarmerName, norm.Village, 'Transplant', norm.Status);
    
    // In this sheet, doses and weedicide are text (e.g. "Pretilachlor 50% - 4Kg") rather than Dates
    // The instructions said Day by Day tracker is for Sowing, Transplant, Harvest dates.
    // If the weedicide isn't a date, we shouldn't add it to the calendar. 
    // `addActivity` already checks `isValid(new Date(dateStr))`, so passing text will safely ignore it.
    addActivity(norm.ExpectedHarvestDate, norm.FarmerName, norm.Village, 'Expected Harvest', norm.Status);

    return { 
      ...f, 
      'Farmer Name': norm.FarmerName,
      'Village': norm.Village,
      'Taluk': norm.Taluk,
      'Acre': norm.Acre,
      'Expected Quantity (MT)': norm.ExpectedYield,
      'Assigned To': norm.AssignedTo,
      'Procurement Status': norm.ProcurementStatus,
      'Status': norm.Status,
      'Confirm': norm.Confirm,
      'Seed Company': norm.SeedCompany,
      'Remarks': norm.Remarks,
      _numericAcre: norm.Acre, 
      _numericYield: norm.ExpectedYield 
    };
  });

  // ── Aggregate remarks from the DELETED farmers sheet ────────────────────
  const deletedRemarksCount = {};
  let totalDeleted = deletedData.length;

  deletedData.forEach(f => {
    const remark = (
      f['Remarks'] || f['remarks'] || f['REMARKS'] ||
      f['Remark'] || f['remark'] || 'No Remark'
    ).toString().trim();
    const key = remark || 'No Remark';
    deletedRemarksCount[key] = (deletedRemarksCount[key] || 0) + 1;
  });

  // Convert objects to array formats for Recharts
  const formatChartData = (obj, nameKey, valKey) => {
    return Object.keys(obj).map(k => ({ [nameKey]: k, [valKey]: obj[k] })).sort((a, b) => b[valKey] - a[valKey]);
  };

  return {
    farmers: formattedFarmers,
    deletedFarmers: deletedData,
    stats: {
      totalFarmers,
      totalAcres: parseFloat(totalAcres.toFixed(2)),
      totalYield: parseFloat(totalYield.toFixed(2)),
      activeFields,
      confirmedCount,
      notConfirmedCount,
      sownCount,
      notSownCount,
      transplantCount,
      harvestedCount,
      rejectedCount,
      deletedCount: totalDeleted
    },
    charts: {
      talukYield: formatChartData(talukYield, 'name', 'value'),
      supervisorComparison: Object.keys(assignedToStats).map(k => ({
        name: k,
        farmers: assignedToStats[k].farmers,
        acres: parseFloat(assignedToStats[k].acres.toFixed(2)),
        yield: parseFloat(assignedToStats[k].yield.toFixed(2)),
      })).sort((a, b) => b.yield - a.yield),
      procurement: formatChartData(procurementStatuses, 'name', 'value'),
      // remarksData now comes from the DELETED sheet (remarks as rejection reasons)
      remarksData: formatChartData(deletedRemarksCount, 'name', 'value'),
      rejectedByRemark: formatChartData(deletedRemarksCount, 'name', 'value')
    },
    calendarActivities // For the day-by-day table
  };
};
