import { Container } from 'react-bootstrap';
import { DataProvider, OptionsProvider, ErrorProvider } from 'contexts';
import { ErrorMessage } from 'components/error-message';
import { SliceView } from 'components/slice-view';

export const App = () => {  
  return (
    <DataProvider>
    <OptionsProvider>
    <ErrorProvider>
      <Container fluid className='mt-2'>
        <SliceView />
        <ErrorMessage />
      </Container>
    </ErrorProvider>
    </OptionsProvider>
    </DataProvider>
  );
};
