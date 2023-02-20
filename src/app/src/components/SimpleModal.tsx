import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    ModalProps,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

export default function SimpleModal({
    title,
    isOpen,
    onClose,
    children,
    ...modalProps
}: {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
} & ModalProps) {
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} {...modalProps}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{children}</ModalBody>

                    <ModalFooter>
                        <Button mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
