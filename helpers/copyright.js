/**
 * Gets the proper copyright date.
 */
module.exports = () => {

    // The variable dates.
    const
        foundingYear = 2019,
        currentYear = (new Date()).getFullYear();

    // The resuting date range.
    let properRange = (foundingYear == currentYear) ? foundingYear : `${foundingYear} - ${currentYear}`;

    // Returning the proper date range.
    return properRange;
};

