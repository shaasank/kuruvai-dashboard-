import { isValid, format } from 'date-fns';

export const processData = ({ active = [], deleted = [], initial = [] }) => {
  const rawData = active || [];
  const deletedData = deleted || [];
  const initialData = initial || [];
  
  if (!rawData || rawData.length === 0) return { 
    farmers: [], 
    stats: { targetYield: 2000 }, 
    charts: { remarksData: [], rejectedByRemark: [] } 
  };

  const cleanNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const getField = (obj, ...possibleKeys) => {
    if (!obj) return undefined;
    const keys = Object.keys(obj);
    for (const target of possibleKeys) {
      const match = keys.find(k => k.trim().toLowerCase() === target.toLowerCase());
      if (match !== undefined) return obj[match];
    }
    return undefined;
  };

  // Calculate Initial Baseline
  let initialFarmers = initialData.length;
  let initialAcres = initialData.reduce((acc, row) => acc + cleanNumber(getField(row, 'Acre', 'Acres', 'Area')), 0);

  let totalFarmers = 0;
  let globalAcres = 0; // Total area of ALL farmers for comparison
  let totalAcres = 0;  // Sown area for KPI
  let totalYield = 0;
  let activeFields = 0;

  const targetYield = 2000; // Tons target

  const talukYield = {};
  const assignedToStats = {};
  const procurementStatuses = {};
  const remarksCount = {};

  let confirmedCount = 0;
  let confirmedAcres = 0;
  let notConfirmedCount = 0;
  let sownCount = 0;
  let notSownCount = 0;
  let transplantCount = 0;
  let harvestedCount = 0;
  let rejectedCount = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Date-based tracker for "Day-by-Day Tracking"
  // Format: { '2024-06-15': [ { farmer: '...', activity: 'Weedicide', ... } ] }
  const calendarActivities = {};



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
      FarmerName: getField(f, 'Farmer name', 'Farmer Name', 'Name') || 'Unknown Farmer',
      Village: getField(f, 'Village') || 'Unknown',
      Taluk: getField(f, 'Taluk') || 'Unknown',
      Acre: cleanNumber(getField(f, 'Acre', 'Acres', 'Area')),
      ExpectedYield: cleanNumber(getField(f, 'Expected Qnty (In MT)', 'Expected Quantity (MT)', 'Expected Yield')),
      AssignedTo: getField(f, 'Assingned to', 'Assigned to', 'Assigned To', 'Supervisor') || 'Unassigned',
      ProcurementStatus: getField(f, 'Procurement status', 'Procurement Status') || 'Unknown',
      Confirm: String(getField(f, 'Confirm', 'Confirmed') || '').trim(),
      Heritage: getField(f, 'Heritage') || 0,
      PurchasedYear: getField(f, 'Purchased year', 'Purchased Year') || 'Nil',
      Status: getField(f, 'Status') || 'Inactive',
      ToBeConfirmedOn: getField(f, 'To be confirmed on', 'To Be Confirmed On') || '',
      SeedCompany: getField(f, 'Seed company', 'Seed Company') || '',
      SowingDate: getField(f, 'Sowing date', 'Sowing Date') || '',
      DirectSowing: getField(f, 'Direct sowing / Transplant', 'Direct Sowing / Transplant') || '',
      TransplantDate: getField(f, 'Transplant Date', 'Transplant date') || '',
      Weedicide: getField(f, 'Weedicide') || '',
      Date: getField(f, 'Date') || '',
      Dose1: getField(f, '1st dose', '1st Dose') || '',
      Dose2: getField(f, '2nd dose', '2nd Dose') || '',
      Dose3: getField(f, '3rd dose', '3rd Dose') || '',
      PlantProtection: getField(f, 'Plant protection', 'Plant Protection') || '',
      ExpectedHarvestDate: getField(f, 'Expected harvest date', 'Expected Harvest Date') || '',
      Remarks: getField(f, 'Remarks', 'remark') || ''
    };

    totalFarmers++;
    globalAcres += norm.Acre;
    
    if (norm.Status.toLowerCase().includes('active') || norm.Status.toLowerCase() === 'confirmed') {
      activeFields++;
    }

    // New specific KPIs tracking
    if (norm.Confirm.toLowerCase() === 'yes') {
      confirmedCount++;
      confirmedAcres += norm.Acre;
    } else {
      notConfirmedCount++;
    }

    const sDateRaw = norm.SowingDate;
    const sDate = sDateRaw ? String(sDateRaw).trim().toLowerCase() : '';
    const isSown = sDate !== '' && 
                   sDate !== 'tbd' && 
                   sDate !== 'nil' && 
                   sDate !== 'none' && 
                   sDate !== '-' && 
                   sDate !== 'null' && 
                   sDate !== 'undefined';
    
    if (isSown) {
      sownCount++;
      totalAcres += norm.Acre;
      totalYield += norm.ExpectedYield;

      // Everything inside this block is now "Sown-Only"
      if (norm.Status.toLowerCase().includes('active') || norm.Status.toLowerCase() === 'confirmed') {
        activeFields++;
      }

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
    } else {
      // Pending Sowing = Confirmed but not yet Sown
      if (norm.Confirm.toLowerCase() === 'yes') {
        notSownCount++;
      }
    }

    if (norm.TransplantDate && norm.TransplantDate.toLowerCase() !== 'tbd') transplantCount++;

    // Track Activities (Independent of filter so timeline remains useful)
    addActivity(norm.SowingDate, norm.FarmerName, norm.Village, 'Sowing', norm.Status);
    addActivity(norm.TransplantDate, norm.FarmerName, norm.Village, 'Transplant', norm.Status);
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
      _isSown: isSown,
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

  const farmerTrend = totalFarmers - initialFarmers;
  const acreTrend = globalAcres - initialAcres;
  const yieldProgress = (totalYield / targetYield) * 100;

  return {
    farmers: formattedFarmers.filter(f => f._isSown),
    deletedFarmers: deletedData,
    stats: {
      totalFarmers,
      initialFarmers,
      farmerTrend,
      globalAcres: parseFloat(globalAcres.toFixed(2)),
      totalAcres: parseFloat(totalAcres.toFixed(2)),
      initialAcres: parseFloat(initialAcres.toFixed(2)),
      acreTrend: parseFloat(acreTrend.toFixed(2)),
      totalYield: parseFloat(totalYield.toFixed(2)),
      targetYield,
      yieldProgress: parseFloat(yieldProgress.toFixed(1)),
      activeFields,
      confirmedCount,
      confirmedAcres: parseFloat(confirmedAcres.toFixed(2)),
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
