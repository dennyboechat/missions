// Components
import { Card } from '@radix-ui/themes';

// Types
import { CardButtonProps } from '../types/CardButtonProps';

export const CardButton = ({ children }: CardButtonProps) =>
    <Card asChild>
        {children}
    </Card>
