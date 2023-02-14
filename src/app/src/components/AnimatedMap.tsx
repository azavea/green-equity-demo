import UsaMapContainer from './UsaMapContainer';
import StatesLayer from './StatesLayer';

export default function AnimatedMap() {
    return (
        <UsaMapContainer>
            <StatesLayer />
        </UsaMapContainer>
    );
}
