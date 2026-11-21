import React from 'react';
import styled from '@emotion/styled';
import AddToHomeButton from './AddToHomeButton';
import { useTheme } from '../context/ThemeContext';

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderControls: React.FC = () => {
  const { theme } = useTheme();
  return (
    <ControlsContainer>
      <ButtonGroup>
        <AddToHomeButton theme={theme} />
      </ButtonGroup>
    </ControlsContainer>
  );
};

export default HeaderControls; 