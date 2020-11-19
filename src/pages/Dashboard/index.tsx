import React, { useEffect, useState, useCallback } from 'react';

import { FaFileCsv } from 'react-icons/fa';

import { TileLayer, Marker, Popup } from 'react-leaflet';

import { lighten } from 'polished';

import { LatLngTuple } from 'leaflet';

import { toast } from 'react-toastify';

import { isWebUri } from 'valid-url';

import { AxiosError } from 'axios';

import { parseISO } from 'date-fns';

import api from '../../services/api';

import { Container, MapContainer, Header, Select } from './styles';

import Button from '../../components/Button';

import Input from '../../components/Input';

interface IOption {
  value: string;
  label: string;
}

interface ICSVFile {
  id: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface IPoint {
  id: string;
  point: {
    type: string;
    coordinates: LatLngTuple;
  };
  fileId: string;
  createdAt: string;
  updatedAt: string;
}

interface IStoreFileResponse {
  file: ICSVFile;
  geographicPoints: IPoint[];
}

const Dashboard: React.FC = () => {
  const [currentFile, setCurrentFile] = useState<string>();

  const [files, setFiles] = useState<IOption[]>([]);

  const [points, setPoints] = useState<IPoint[]>([]);

  const [loadingFiles, setLoadingFiles] = useState<boolean>(true);

  const [csvUrl, setCsvUrl] = useState<string>('');

  const fileToOption = (file: ICSVFile): IOption => {
    return {
      label: `${parseISO(file.createdAt).toLocaleString()} - ${file.url}`,
      value: file.id,
    };
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get<ICSVFile[]>('/files');

        const { data: filesData } = response;

        setLoadingFiles(false);

        setFiles(filesData.map(file => fileToOption(file)));

        if (filesData.length > 0) {
          const newestFileId = filesData[0].id;
          setCurrentFile(newestFileId);
        }
      } catch (error) {
        const err = error as AxiosError;

        if (err.response) {
          const { message } = err.response.data;
          if (message) {
            toast.error(message);
            return;
          }
        }

        toast.error('An error occurred while loading csv files history.');
      }
    })();
  }, []);

  useEffect(() => {
    if (currentFile) {
      (async () => {
        try {
          const response = await api.get(`/points/${currentFile}`);

          const { data: pointsData } = response;

          setPoints(pointsData);
        } catch (error) {
          toast.error(
            'An error occurred while loading geographic points of the specified csv file.',
          );
        }
      })();
    }
  }, [currentFile]);

  const storeCSV = useCallback(() => {
    if (!csvUrl) {
      toast.error('Please enter the csv file url.');
      return;
    }

    if (!isWebUri(csvUrl)) {
      toast.error('Invalid file url.');
      return;
    }

    (async () => {
      try {
        const response = await api.post<IStoreFileResponse>('/files', {
          url: csvUrl,
        });

        const { file } = response.data;

        setCsvUrl('');

        setCurrentFile(file.id);

        setFiles(currentFiles => [fileToOption(file), ...currentFiles]);

        setPoints([]);
      } catch (error) {
        const err = error as AxiosError;

        if (err.response) {
          const { message } = err.response.data;
          if (message) {
            toast.error(message);
            return;
          }
        }

        toast.error('Error while importing csv file data.');
      }
    })();
  }, [csvUrl]);

  return (
    <Container>
      <Header>
        <strong>Desafio Cyan</strong>

        <Select
          testid="select-file"
          className="csv-history"
          classNamePrefix="select"
          isLoading={loadingFiles}
          isClearable
          isSearchable
          name="csv-history"
          options={files}
          menuPortalTarget={document.body}
          menuPlacement="bottom"
          menuPosition="absolute"
          onChange={(file: IOption) => {
            return setCurrentFile(file ? file.value : undefined);
          }}
          value={files.find(file => file.value === currentFile)}
          simpleValue
          styles={{
            menuPortal: (base: any) => ({
              ...base,
              zIndex: 9999,
            }),
            menu: (base: any) => ({
              ...base,
              background: '#232129',
            }),
            option: (base: any) => ({
              ...base,
              ':hover': {
                backgroundColor: lighten(0.1, '#232129'),
              },
            }),
          }}
          placeholder="Select a file from history"
        />

        <div>
          <Input
            name="csv-path"
            icon={FaFileCsv}
            placeholder="CSV file url"
            onChange={e => setCsvUrl(e.target.value)}
            value={csvUrl}
            data-testid="csv-path-input"
          />
          <Button onClick={storeCSV} data-testid="csv-path-button">
            ADD
          </Button>
        </div>
      </Header>
      <MapContainer
        center={
          points.length > 0 ? points[0].point.coordinates : [51.505, -0.09]
        }
        zoom={10}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map(point => {
          const { point: pointData } = point;

          const [latitude, longitude] = pointData.coordinates;

          const checkLatitude =
            Number.isFinite(latitude) && Math.abs(latitude) < 90;

          const checkLongitude =
            Number.isFinite(longitude) && Math.abs(longitude) < 180;

          return checkLatitude && checkLongitude ? (
            <Marker position={pointData.coordinates} key={point.id}>
              <Popup>
                Coordinates: ({latitude} , {longitude})
              </Popup>
            </Marker>
          ) : null;
        })}
      </MapContainer>
    </Container>
  );
};

export default Dashboard;
