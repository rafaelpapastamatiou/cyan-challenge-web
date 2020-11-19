import styled from 'styled-components';

import { MapContainer as LeafletMapContainer } from 'react-leaflet';

import ReactSelect from 'react-select';

import { shade } from 'polished';
import { Container as InputContainer } from '../../components/Input/styles';

export const Container = styled.div`
  height: 100vh;
  display: flex;
  align-items: stretch;
  flex-direction: column;
`;

export const MapContainer = styled(LeafletMapContainer)`
  flex: 1;
`;

export const Header = styled.header`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  justify-content: flex-start;

  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

  strong {
    font-size: 30px;
  }

  div:nth-of-type(2) {
    margin-left: auto;
  }

  > div:not(.csv-history) {
    display: flex;
    flex-direction: row;
    align-items: center;

    button {
      margin: 0;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border: 0;
    }

    ${InputContainer} {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border: 0;
      height: 56px;
      margin: 0;
    }
  }
`;

export const Select = styled(ReactSelect)`
  flex: 1;
  max-width: 500px;
  margin-left: 48px;

  .select__control {
    background: #232129;
    border-color: #232129;
    padding: 8px;
  }

  .select__single-value {
    color: #f4ede8 !important;
  }

  .select__placeholder {
    color: ${shade(0.3, '#f4ede8')} !important;
  }
`;
