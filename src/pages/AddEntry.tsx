import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stateActions } from '../store/index';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateUtils } from '../helpers/date.utils';
import weightService from '../services/WeightService';
import SpinnerTimer from '../components/spinner/SpinnerTimer';
import type { WeightEntry } from '../models/weight-entry';
import { isValid } from 'date-fns';

const AddEntry = () => {
  const dispatcher = useDispatch();
  const weightEntries = useSelector((state: any) => state.weightEntries);
  const notesRef = useRef<HTMLTextAreaElement>();
  const navigate = useNavigate();
  const [addEntryState, setAddEntryState] = useState({
    weightEntry: { dt: DateUtils.formatDate(new Date()), lbs: 200, notes: '' },
    dateForUI: new Date(),
    isUpdate: false,
    busy: { state: false, message: '' },
  });
  let location = useLocation();
  const updateBusy = (isBusy: boolean, message: string) => {
    setAddEntryState((prevState) => {
      return { ...prevState, busy: { state: isBusy, message: message } };
    });
  };

  const handleIncrement = (evt) => {
    const currentWeight = addEntryState.weightEntry.lbs;
    updateWeightEntry({
      ...addEntryState.weightEntry,
      lbs: parseFloat((currentWeight + 0.1).toFixed(1)),
    });
  };

  const handleDecrement = (evt) => {
    const currentWeight = addEntryState.weightEntry.lbs;
    updateWeightEntry({
      ...addEntryState.weightEntry,
      lbs: parseFloat((currentWeight - 0.1).toFixed(1)),
    });
  };

  const updateWeightEntry = (weightEntry: WeightEntry) => {
    setAddEntryState((prevState) => {
      return { ...prevState, weightEntry: weightEntry };
    });
  };

  const setDateForUI = (dt: Date) => {
    setAddEntryState((prevState) => {
      return { ...prevState, dateForUI: dt };
    });
  };

  const setIsUpdate = (isUpdate: boolean) => {
    setAddEntryState((prevState) => {
      return { ...prevState, isUpdate: isUpdate };
    });
  };
  // The empty dependency array in this effect is intentional.  If I put weightEntry in there, I will never be able
  // to change the state in other places - it will always revert back to what was passed in on the location
  useEffect(() => {
    if (!weightEntries || weightEntries.length < 1) {
      const callServer = async () => {
        updateBusy(true, 'Loading weight entries from DB...');
        const locWeightEntriesData: any = await weightService.getEntries();
        dispatcher(stateActions.setWeightEntries(locWeightEntriesData.data));
        updateBusy(false, '');
      };
      callServer();
    }
    if (location.state && location.state.hasOwnProperty('dt')) {
      // caller is passing in a weight entry to edit...
      const locationWeightEntry = location.state as WeightEntry;
      
      // Ensure lbs is always a valid number to prevent controlled input issues
      const validLbs = typeof locationWeightEntry.lbs === 'number' && !isNaN(locationWeightEntry.lbs) 
        ? locationWeightEntry.lbs 
        : addEntryState.weightEntry.lbs;
      
      updateWeightEntry({
        ...locationWeightEntry,
        lbs: validLbs
      });
      
      const parsedDate = DateUtils.parseDate(locationWeightEntry.dt);
      // Ensure we always have a valid Date object for the DatePicker
      if (parsedDate && isValid(parsedDate)) {
        setDateForUI(parsedDate);
      } else {
        setDateForUI(new Date());
      }
      setIsUpdate(true);
    } else {
      // this is a new weight entry for the current date - so, want to default the weight to the last recorded weight
      if (weightEntries.length > 0) {
        const lastEntryWeight = weightEntries[weightEntries.length - 1].lbs;
        // Ensure the last entry weight is a valid number before using it
        const validLastWeight = typeof lastEntryWeight === 'number' && !isNaN(lastEntryWeight) 
          ? lastEntryWeight 
          : 200; // fallback to default weight if invalid
        
        updateWeightEntry({
          ...addEntryState.weightEntry,
          lbs: validLastWeight,
        });
      }
    }
  }, [weightEntries, dispatcher]);

  const handleDate = (date: Date) => {
    setDateForUI(date);
    updateWeightEntry({
      ...addEntryState.weightEntry,
      dt: DateUtils.formatDate(date),
    });
  };

  const handleWeight = (event: any) => {
    const inputValue = event.target.value;
    const parsedValue = parseFloat(inputValue);
    
    // Ensure we always have a valid number to maintain controlled input
    const weightValue = isNaN(parsedValue) || inputValue === '' ? 0 : parsedValue;
    
    updateWeightEntry({
      ...addEntryState.weightEntry,
      lbs: weightValue,
    });
  };

  const handleAddEntry = async () => {
    updateBusy(true, 'Saving entry...');
    console.log(
      'AddEntry.handleAddEntry - calling weightService.addEntry(weightEntry)...  Current value of weightEntry is:'
    );
    console.log(addEntryState.weightEntry);
    const addEntryResult: any = await weightService.addEntry(
      addEntryState.weightEntry
    );
    console.log('AddEntry.handleAddEntry - here is the response:');
    console.log(addEntryResult.data);
    if (
      typeof addEntryResult.data === 'string' &&
      addEntryResult.data.startsWith('error')
    ) {
      console.log('There was an error: ' + addEntryResult.data);
    } else {
      dispatcher(stateActions.addWeightEntry(addEntryResult.data));
      updateBusy(false, '');
      navigate('/allEntries');
    }
  };

  const handleOnBlur = (event) => {
    updateWeightEntry({
      ...addEntryState.weightEntry,
      notes: event.target.value,
    });
    if (notesRef !== undefined && notesRef.current) {
      console.log(
        'AddEntry.handleOnBlur - setting notesRef.current.textContent to:'
      );
      console.log(event.target.value);
      notesRef.current.textContent = event.target.value;
    }
  };

  return (
    <Container className="mt-3">
      {addEntryState.busy.state && (
        <SpinnerTimer message={addEntryState.busy.message} />
      )}
      <h3 className="mb-3">Add New Weight Entry</h3>
      <Row className="mb-2">
        <Col lg="4">
          <DatePicker
            selected={addEntryState.dateForUI}
            onChange={handleDate}
          />
        </Col>
      </Row>
      <Row className="mb-2">
        <Col className="me-0">
          <Form.Control
            type="number"
            value={addEntryState.weightEntry.lbs}
            placeholder="Enter Weight"
            onChange={handleWeight}
          />
        </Col>
        <Col className="my-auto">
          <Form.Text>lbs</Form.Text>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" onClick={handleIncrement}>
            +
          </Button>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" onClick={handleDecrement}>
            −
          </Button>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col lg="4">
          <textarea
            rows={10}
            ref={notesRef}
            onBlur={handleOnBlur}
            className="form-control"
            defaultValue={addEntryState.weightEntry.notes}
          />
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <Button className="btn btn-primary" onClick={handleAddEntry}>
            {addEntryState.isUpdate ? 'Update Entry' : 'Add Entry'}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default AddEntry;