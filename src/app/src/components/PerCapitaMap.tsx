import UsaMapContainer from './UsaMapContainer';
import StatesLayer from './StatesLayer';

export default function PerCapitaMap() {
    return (
        <UsaMapContainer>
            <StatesLayer />
        </UsaMapContainer>
    );
}
