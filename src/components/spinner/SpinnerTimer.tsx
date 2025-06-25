import { useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useIsMounted } from '../../helpers/is-mounted';

const SpinnerTimer = ({ message }: { message: string }) => {
  const [seconds, setSeconds] = useState(0);
  const isMounted = useIsMounted();
  setTimeout(() => {
    // SW [11/11/2021 5:53 AM] Make sure this component is still mounted before doing the state update
    // otherwise will get the following message:
    // Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
    if (isMounted.current) {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }
  }, 1000);
  return (
    <Container>
      <Spinner animation="border" role="status"></Spinner>{' '}
      <span className="text-lg-center">
        {message + ' (' + seconds + ' seconds)'}
      </span>
    </Container>
  );
};

export default SpinnerTimer;
