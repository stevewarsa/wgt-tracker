// noinspection CheckTagEmptyBody

import { useDispatch, useSelector } from 'react-redux';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import type { GridReadyEvent } from 'ag-grid-community';
import type { GridApi } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { Container } from 'react-bootstrap';
import { DateUtils } from '../helpers/date.utils';
import type { WeightEntry } from '../models/weight-entry';
import { useEffect, useState, useRef } from 'react';
import weightService from '../services/WeightService';
import SpinnerTimer from '../components/spinner/SpinnerTimer';
import { stateActions } from '../store';
import { ButtonCellRenderer } from '../renderers/button.cell.renderer';
import { useNavigate } from 'react-router-dom';
import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

// Register the client-side row model module
ModuleRegistry.registerModules([ClientSideRowModelModule, QuickFilterModule]);

const AllEntries = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const weightEntries: WeightEntry[] = useSelector(
    (st: any) => st.weightEntries
  );
  const [busy, setBusy] = useState({ state: false, message: '' });
  const [gridReady, setGridReady] = useState(false);
  const gridApiRef = useRef<GridApi | null>(null);

  useEffect(() => {
    const callServer = async () => {
      setBusy({ state: true, message: 'Loading weight entries from DB...' });
      const locWeightEntriesData: any = await weightService.getEntries();
      dispatch(stateActions.setWeightEntries(locWeightEntriesData.data));
      setBusy({ state: false, message: '' });
    };
    callServer();
  }, [dispatch]);

  const loadEntry = (data: WeightEntry) => {
    navigate('/addEntry', { state: data });
  };

  const handleQuickFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const api = gridApiRef.current;
    api!.setGridOption(
        "quickFilterText",
        event.target.value,
    );
  };

  const onGridReady = (params: GridReadyEvent) => {
    gridApiRef.current = params.api;
    setGridReady(true);
  };

  const buttonCellRendererParams = {
    showUnderline: true,
    onClick: (params: any) => {
      loadEntry(params.data);
    },
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Date',
      headerTooltip: 'Date',
      field: 'dt',
      width: 120,
      cellRenderer: ButtonCellRenderer,
      cellRendererParams: buttonCellRendererParams,
      cellStyle: { cursor: 'pointer' },
    },
    {
      headerName: 'LBS',
      field: 'lbs',
      width: 70,
    },
    {
      headerName: 'Notes',
      field: 'notes',
      width: 500,
      wrapText: true,
      autoHeight: true,
      valueFormatter: (params: any) =>
        params.node.data && params.node.data.notes
          ? params.node.data.notes
          : '',
      cellRenderer: (params: any) => params.valueFormatted,
    },
  ];

  if (busy.state) {
    return <SpinnerTimer key="loading-weight-entries" message={busy.message} />;
  } else {
    if (!weightEntries || weightEntries.length === 0) {
      return <h1>No Weight Entries Found - Use Add Entry!</h1>;
    } else {
      const locWeightEntries = [...weightEntries];
      locWeightEntries.sort((a: WeightEntry, b: WeightEntry) => {
        const dt1 = DateUtils.parseDate(a.dt);
        const dt2 = DateUtils.parseDate(b.dt);
        if (DateUtils.isBefore(dt1, dt2)) {
          return 1;
        } else if (DateUtils.isAfter(dt1, dt2)) {
          return -1;
        }
        return 0;
      });

      return (
        <Container
          className="ag-theme-alpine"
          style={{ height: 400, width: '100%' }}
        >
          <input
            type="text"
            placeholder="Quick Filter"
            onChange={handleQuickFilter}
            disabled={!gridReady}
          />
          <AgGridReact
            rowModelType="clientSide"
            theme="legacy"
            onGridReady={onGridReady}
            rowData={locWeightEntries}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={5}
          />
        </Container>
      );
    }
  }
};

export default AllEntries;