function validateConfig(config) {
  const availableVaccines = ['COVISHIELD', 'COVAXIN', 'SPUTNIK V'];

  if (!config.pincode) {
    console.error('no pincode was provided in the config');

    process.exit(1);
  }
  const ageFilters = config.minAge || [];

  for (const ageFilter of ageFilters) {
    if (isNaN(ageFilter)) {
      console.error(`invalid minAge ${ageFilter} in config`);

      process.exit(1);
    }
  }

  const vaccineFilters = config.vaccines || [];

  for (const vaccineFilter of vaccineFilters) {
    if (!availableVaccines.includes(vaccineFilter.toUpperCase())) {
      console.error(`invalid vaccine ${vaccineFilter} in config`);

      process.exit(1);
    }
  }
}

module.exports = { validateConfig };
