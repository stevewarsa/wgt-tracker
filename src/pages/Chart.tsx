// noinspection RequiredAttributes

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { WeightEntry } from '../models/weight-entry';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { DateUtils } from '../helpers/date.utils';
import {
  ButtonGroup,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Row,
} from 'react-bootstrap';
import weightService from '../services/WeightService';
import { stateActions } from '../store';
import SpinnerTimer from '../components/spinner/SpinnerTimer';
import DatePicker from 'react-datepicker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Weight By Date',
    },
  },
};
const ALL_YEARS = 'All Years';
const LAST_30_DAYS = 'Last 30 Days';
const CUSTOM = 'Custom';

const getYear = (weightEntry: WeightEntry) =>
  DateUtils.parseDate(weightEntry.dt).getFullYear();
const sortWeightEntries = (weightEntries: WeightEntry[]) => {
  if (!weightEntries || weightEntries.length === 0) {
    return weightEntries;
  } else {
    return weightEntries.sort((w1, w2) => {
      if (DateUtils.equals(w1.dt, w2.dt)) {
        return 0;
      } else if (DateUtils.isBefore(w1.dt, w2.dt)) {
        return -1;
      } else {
        return 1;
      }
    });
  }
};
const sortDates = (dates: string[]) => {
  return dates.sort((dt1, dt2) => {
    if (DateUtils.equals(dt1, dt2)) {
      return 0;
    } else if (DateUtils.isBefore(dt1, dt2)) {
      return -1;
    } else {
      return 1;
    }
  });
};

const Chart = () => {
  const dispatch = useDispatch();
  const weightEntries: WeightEntry[] = useSelector(
    (st: any) => st.weightEntries
  );
  const [yearFilter, setYearFilter] = useState(LAST_30_DAYS);
  const [weightChartData, setWeightChartData] = useState([]);
  const allLabels: string[] = sortDates(
    weightEntries.map((we: WeightEntry) => we.dt)
  );
  const [weightChartLabels, setWeightChartLabels] = useState([]);
  const [startDateForUI, setStartDateForUI] = useState<Date | null>(null);
  const [endDateForUI, setEndDateForUI] = useState<Date | null>(null);
  const [statsForPeriod, setStatsForPeriod] = useState({
    maxWeight: 0,
    minWeight: 0,
    startWeight: 0,
    endWeight: 0,
    weightLost: 0,
    weightGained: 0,
    weightLostFromMaxToMin: 0,
    weightGainedFromMinToMax: 0,
    startingBmi: 0,
    endingBmi: 0,
    maxBmi: 0,
    minBmi: 0,
  });
  const [busy, setBusy] = useState({ state: false, message: '' });
  const uniqueYears: number[] = [];
  weightEntries
    .map((w) => getYear(w))
    .forEach((y) =>
      !uniqueYears.includes(y) ? uniqueYears.push(y) : () => {}
    );
  let data = {
    labels: weightChartLabels,
    datasets: [
      {
        label: 'Pounds',
        data: weightChartData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  useEffect(() => {
    if (!weightEntries || weightEntries.length === 0) {
      const callServer = async () => {
        setBusy({ state: true, message: 'Loading weight entries from DB...' });
        const locWeightEntriesData: any = await weightService.getEntries();
        dispatch(
          stateActions.setWeightEntries(
            sortWeightEntries(locWeightEntriesData.data)
          )
        );
        setBusy({ state: false, message: '' });
      };
      callServer();
    }
    handleYear(yearFilter);
  }, [weightEntries, yearFilter]);

  const handleYear = (year: string) => {
    if (year === ALL_YEARS) {
      setStartDateForUI(null);
      setEndDateForUI(null);
      setYearFilter(ALL_YEARS);
      setWeightChartData(weightEntries.map((we) => we.lbs));
      setWeightChartLabels(allLabels);
    } else if (year === LAST_30_DAYS) {
      setStartDateForUI(null);
      setEndDateForUI(null);
      setYearFilter(LAST_30_DAYS);
      const filteredWeightEntries = weightEntries.filter((we) => {
        const weightEntryDt = DateUtils.parseDate(we.dt);
        const thirtyDaysAgo = DateUtils.subtractDays(new Date(), 30);
        return (
          DateUtils.equals(weightEntryDt, thirtyDaysAgo) ||
          DateUtils.isAfter(weightEntryDt, thirtyDaysAgo)
        );
      });
      setWeightChartData(filteredWeightEntries.map((we) => we.lbs));
      setWeightChartLabels(
        sortDates(filteredWeightEntries.map((we: WeightEntry) => we.dt))
      );
    } else if (year === CUSTOM) {
      // the start date and end date should be populated
      const filteredWeightEntries = weightEntries.filter((we) => {
        const weightEntryDt = DateUtils.parseDate(we.dt);
        return (
          (DateUtils.equals(weightEntryDt, endDateForUI) ||
            DateUtils.isBefore(weightEntryDt, endDateForUI)) &&
          (DateUtils.equals(weightEntryDt, startDateForUI) ||
            DateUtils.isAfter(weightEntryDt, startDateForUI))
        );
      });
      setWeightChartData(filteredWeightEntries.map((we) => we.lbs));
      setWeightChartLabels(
        sortDates(filteredWeightEntries.map((we: WeightEntry) => we.dt))
      );
    } else {
      // this is a real numeric year
      setStartDateForUI(null);
      setEndDateForUI(null);
      setYearFilter(year);
      const filteredWeightEntries = weightEntries.filter(
        (we) => getYear(we) === parseInt(year)
      );
      setWeightChartData(filteredWeightEntries.map((we) => we.lbs));
      setWeightChartLabels(
        sortDates(filteredWeightEntries.map((we: WeightEntry) => we.dt))
      );
    }
  };

  const calculateBmi = (weight: number, heightInches: number) => {
    let bmi = weight * 703;
    bmi = bmi / heightInches;
    bmi = bmi / heightInches;
    return bmi;
  };

  useEffect(() => {
    console.log('useEffect - here is the weightChartData:', weightChartData);
    if (!weightChartData || weightChartData.length === 0) {
      return;
    }
    // weight chart data changed, so calculate other data
    const startingWeight = weightChartData[0];
    const endingWeight = weightChartData[weightChartData.length - 1];
    console.log(
      'startingWeight=' + startingWeight + ',endingWeight=' + endingWeight
    );
    const gained = endingWeight > startingWeight;
    const gainedAmt = endingWeight - startingWeight;
    const lost = startingWeight > endingWeight;
    const lostAmt = startingWeight - endingWeight;
    const stayedSame = startingWeight === endingWeight;
    let maxWeightForPeriod = 0;
    let dateForMaxWeight = weightChartLabels[0];
    let minWeightForPeriod = 1000;
    let dateForMinWeight = weightChartLabels[weightChartLabels.length - 1];
    for (let i = 0; i < weightChartData.length; i++) {
      const we = { lbs: weightChartData[i], dt: weightChartLabels[i] };
      if (we.lbs > maxWeightForPeriod) {
        maxWeightForPeriod = we.lbs;
        dateForMaxWeight = we.dt;
      }
      if (we.lbs < minWeightForPeriod) {
        minWeightForPeriod = we.lbs;
        dateForMinWeight = we.dt;
      }
    }
    const weightLostFromMaxToMin = DateUtils.isBefore(
      dateForMaxWeight,
      dateForMinWeight
    );
    const weightGainedFromMinToMax = DateUtils.isAfter(
      dateForMaxWeight,
      dateForMinWeight
    );
    const statsForPeriod = {
      maxWeight: maxWeightForPeriod,
      minWeight: minWeightForPeriod,
      startWeight: startingWeight,
      endWeight: endingWeight,
      weightLost: stayedSame || gained ? 0 : lostAmt,
      weightGained: stayedSame || lost ? 0 : gainedAmt,
      weightLostFromMaxToMin: weightLostFromMaxToMin
        ? maxWeightForPeriod - minWeightForPeriod
        : 0,
      weightGainedFromMinToMax: weightGainedFromMinToMax
        ? maxWeightForPeriod - minWeightForPeriod
        : 0,
      startingBmi: calculateBmi(startingWeight, 72),
      endingBmi: calculateBmi(endingWeight, 72),
      maxBmi: calculateBmi(maxWeightForPeriod, 72),
      minBmi: calculateBmi(minWeightForPeriod, 72),
    };
    setStatsForPeriod(statsForPeriod);
  }, [weightChartData]);

  const handleStartDate = (date: Date) => {
    setStartDateForUI(date);
    if (date && endDateForUI) {
      setYearFilter(CUSTOM);
    }
  };
  const handleEndDate = (date: Date) => {
    setEndDateForUI(date);
    if (date && startDateForUI) {
      setYearFilter(CUSTOM);
    }
  };

  if (busy.state) {
    return <SpinnerTimer key="loading-weight-entries" message={busy.message} />;
  } else {
    return (
      <Container>
        <Row className="mt-2">
          <Col className="me-2">
            <DropdownButton
              as={ButtonGroup}
              variant="primary"
              title={yearFilter}
              onSelect={handleYear}
            >
              <Dropdown.Item key={ALL_YEARS} eventKey={ALL_YEARS}>
                {ALL_YEARS}
              </Dropdown.Item>
              <Dropdown.Item key={LAST_30_DAYS} eventKey={LAST_30_DAYS}>
                {LAST_30_DAYS}
              </Dropdown.Item>
              <Dropdown.Item key={CUSTOM} eventKey={CUSTOM}>
                {CUSTOM}
              </Dropdown.Item>
              {uniqueYears.length > 0 &&
                uniqueYears.map((y) => (
                  <Dropdown.Item key={y} eventKey={y}>
                    {y}
                  </Dropdown.Item>
                ))}
            </DropdownButton>
          </Col>
        </Row>
        <Row>
          <Col>
            <span className="fw-bold">Start wt:</span>{' '}
            {statsForPeriod.startWeight}
          </Col>
          <Col>
            <span className="fw-bold">End wt:</span> {statsForPeriod.endWeight}
          </Col>
          <Col>
            <span className="fw-bold">Wt Lost:</span>{' '}
            {statsForPeriod.weightLost.toFixed(2)}
          </Col>
          <Col>
            <span className="fw-bold">Wt Gain:</span>{' '}
            {statsForPeriod.weightGained.toFixed(2)}
          </Col>
        </Row>
        <Row>
          <Col>
            <span className="fw-bold">Max wt:</span> {statsForPeriod.maxWeight}
          </Col>
          <Col>
            <span className="fw-bold">Min wt:</span> {statsForPeriod.minWeight}
          </Col>
          <Col>
            <span className="fw-bold">{'Max->Min:'}:</span>{' '}
            {statsForPeriod.weightLostFromMaxToMin.toFixed(2)}
          </Col>
          <Col>
            <span className="fw-bold">{'Min->Max:'}:</span>{' '}
            {statsForPeriod.weightGainedFromMinToMax.toFixed(2)}
          </Col>
        </Row>
        <Row>
          <Col>
            <span className="fw-bold">Start BMI:</span>{' '}
            {statsForPeriod.startingBmi.toFixed(1)}
          </Col>
          <Col>
            <span className="fw-bold">End BMI:</span>{' '}
            {statsForPeriod.endingBmi.toFixed(1)}
          </Col>
          <Col>
            <span className="fw-bold">Max BMI:</span>{' '}
            {statsForPeriod.maxBmi.toFixed(1)}
          </Col>
          <Col>
            <span className="fw-bold">Min BMI:</span>{' '}
            {statsForPeriod.minBmi.toFixed(1)}
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>Start/End Date</Col>
        </Row>
        <Row className="mt-2">
          <Col className="w-50">
            <DatePicker selected={startDateForUI} onChange={handleStartDate} />
          </Col>
          <Col className="w-50">
            <DatePicker selected={endDateForUI} onChange={handleEndDate} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Line options={options} data={data} />
          </Col>
        </Row>
      </Container>
    );
  }
};

export default Chart;