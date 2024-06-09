// Components
import { Container, Grid, Button } from '@radix-ui/themes';
import { CardButton } from '../components/ui/CardButton';

export default () =>
    <Container>
        <Grid columns={{ initial: '1', md: '3', lg: '5' }} gap='3'>
            <CardButton>
                <Button>Let's go</Button>
            </CardButton>
        </Grid>
    </Container>