/* calculating exposure period based on UKEF SQL function */
const moment = require('moment');
const { formattedTimestamp } = require('../../../facility-dates/timestamp');
const { formatYear } = require('./date-helpers');

const calculateExposurePeriod = (facility) => {
  let coverStartDate;
  if (facility.requestedCoverStartDate) {
    const startDate = moment(formattedTimestamp(facility.requestedCoverStartDate));

    // Need a date without the h:m:s elements as this effects the diff calculation
    coverStartDate = moment([
      formatYear(startDate.year()),
      startDate.month(),
      startDate.date(),
    ]);
  } else {
    coverStartDate = moment([
      formatYear(facility['requestedCoverStartDate-year']),
      facility['requestedCoverStartDate-month'] - 1,
      facility['requestedCoverStartDate-day'],
    ]);
  }

  const coverEndDate = moment([
    formatYear(facility['coverEndDate-year']),
    facility['coverEndDate-month'] - 1,
    facility['coverEndDate-day'],
  ]);

  if (!coverStartDate.isValid() || !coverEndDate.isValid()) {
    return facility.ukefGuaranteeInMonths;
  }

  const durationMonths = coverEndDate.diff(coverStartDate, 'months') + 1;

  const monthOffset = moment(coverStartDate).date() === moment(coverEndDate).date() ? -1 : 0;

  return durationMonths + monthOffset;
};

module.exports = calculateExposurePeriod;

/*
SQL Procedure for reference:

USE [WF_TRADE_FINANCE_DTFS]
GO

****** Object:  UserDefinedFunction [dbo].[fn_DATEDIFF_FULLMONTH]    Script Date: 09/07/2020 12:33:35 ******
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

/*
calculates the  Exposure Period from 2 dates

CREATE FUNCTION [dbo].[fn_DATEDIFF_FULLMONTH]
(
    @GC_DATE DATETIME, -- Guarantee Commencement date
    @GE_DATE DATETIME, -- Guarantee Expiry date
    @INPUT_UKEF_FACILITY_ID nvarchar (10)
)
RETURNS INT
AS
BEGIN
---------------------------------------------------------------
-- Is the commencement/expiry dates the end of month?
DECLARE @GC_END_MONTH int = (select  CASE WHEN EOMONTH(@GC_DATE) = @GC_DATE then 1 Else 0 END)
DECLARE @GE_END_MONTH int = (select  CASE WHEN EOMONTH(@GE_DATE) = @GE_DATE then 1 Else 0 END)
---------------------------------------------------------------
-- Is a portal case and does it have a Facility ID
DECLARE @FACILITY_ID_EXISTS int = CASE WHEN
    (Select UKEF_FACILITY_ID from FACILITY where UKEF_FACILITY_ID = @INPUT_UKEF_FACILITY_ID) IS NULL
      THEN 0 ELSE 1 END
DECLARE @PORTAL_ID_EXISTS int =  CASE WHEN
    (Select FACILITY_PORTAL_ID from FACILITY where FACILITY_PORTAL_ID = @INPUT_UKEF_FACILITY_ID) IS NULL
      THEN 0 ELSE 1 END

--Type of Facilty Product is it EWCS or BS
-- This will only work if a correct  UKEF Facility ID or Facility Portal ID has been passed to the function
DECLARE @PRODUCT Nvarchar(2)

IF @FACILITY_ID_EXISTS = 1 BEGIN
SET @PRODUCT = (Select PRODUCT_GROUP_ID FROM FACILITY F
Join PRODUCT_TYPE PT on F.D_PRODUCT_TYPE_ID = PT.D_PRODUCT_TYPE_ID
JOIN PRODUCT_GROUP PG on PT.D_PRODUCT_GROUP_ID = PG.D_PRODUCT_GROUP_ID
Where UKEF_FACILITY_ID = @INPUT_UKEF_FACILITY_ID);
END
ELSE IF @PORTAL_ID_EXISTS = 1 BEGIN
SET @PRODUCT = (Select PRODUCT_GROUP_ID FROM FACILITY F
Join PRODUCT_TYPE PT on F.D_PRODUCT_TYPE_ID = PT.D_PRODUCT_TYPE_ID
JOIN PRODUCT_GROUP PG on PT.D_PRODUCT_GROUP_ID = PG.D_PRODUCT_GROUP_ID
Where FACILITY_PORTAL_ID = @INPUT_UKEF_FACILITY_ID);
END

--------------------------------------------------------------
DECLARE @RESULT int
/*
Please note that if the expiry and commencement dates are the same day
i.e. 15th then you have different rules for BS and EWCS. for BS you add 1 for EWCS you dont
BUT.... this is different if the commencement date is EOM in that case you only add one period
if the expiry date is also EOM (end of month).
You only need to check if the expiry date is EOM AFTER you have confirmed that the commnencement date is EOM,
If the Commencement date is EOM then for EWCS cases you do not need to add on an
extra period as you will be comparing against the EOM of the expiry month.
For BS cases you only add on a period if the expiry date is also EOM

IF (@GC_END_MONTH = 0 AND @PRODUCT = 'EW')
BEGIN

    SET @RESULT = (
                    SELECT
                    CASE
                        WHEN DATEPART(DAY, @GC_DATE) < DATEPART(DAY, @GE_DATE)
                        THEN DATEDIFF(MONTH, @GC_DATE, @GE_DATE) + 1
                        ELSE DATEDIFF(MONTH, @GC_DATE, @GE_DATE)
                    END
                    )

END

ELSE IF  (@GC_END_MONTH = 0 AND @PRODUCT = 'BS')
BEGIN
    SET @RESULT = (
                    SELECT
                    CASE
                        WHEN DATEPART(DAY, @GC_DATE) <= DATEPART(DAY, @GE_DATE)
                        THEN DATEDIFF(MONTH, @GC_DATE, @GE_DATE) + 1
                        ELSE DATEDIFF(MONTH, @GC_DATE, @GE_DATE)
                    END
                    )
END

ELSE IF  @GC_END_MONTH = 1  AND  @PRODUCT = 'EW'
BEGIN

    SET @RESULT = (
                    SELECT DATEDIFF(MONTH, @GC_DATE, @GE_DATE)

                    )
END

ELSE IF  @GC_END_MONTH = 1  AND  @PRODUCT = 'BS'
BEGIN

    SET @RESULT = (
                    SELECT DATEDIFF(MONTH, @GC_DATE, @GE_DATE) + @GE_END_MONTH

                    )
END
--
    RETURN @Result
END

GO
*/
