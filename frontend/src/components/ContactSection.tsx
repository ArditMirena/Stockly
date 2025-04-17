import {
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  SimpleGrid,
  ActionIcon,
  Group,
  Stack,
  Box
} from '@mantine/core';
import {
  PiInstagramLogoBold,
  PiTwitterLogoBold,
  PiYoutubeLogoBold,
  PiFacebookLogoBold,
  PiAtBold,
  PiPhoneBold,
  PiMapPinBold,
  PiSunBold
} from "react-icons/pi";
import classes from '../style/ContactSection.module.css';

const socials = [PiInstagramLogoBold, PiFacebookLogoBold, PiTwitterLogoBold, PiYoutubeLogoBold];

const contactInfo = [
  { title: 'Email', description: 'hello@mantine.dev', icon: PiAtBold },
  { title: 'Phone', description: '+49 (800) 335 35 35', icon: PiPhoneBold },
  { title: 'Address', description: '844 Morris Park Avenue', icon: PiMapPinBold },
  { title: 'Working hours', description: '8 a.m. – 11 p.m.', icon: PiSunBold },
];

const ContactIcon = ({ icon: Icon, title, description }: any) => {
  return (
    <div className={classes.iconWrapper}>
      <Box mr="md">
        <Icon size={24} />
      </Box>
      <div>
        <Text size="xs" className={classes.iconTitle}>{title}</Text>
        <Text className={classes.iconDescription}>{description}</Text>
      </div>
    </div>
  );
};

const ContactSection = () => {
  return (
    <div className={classes.wrapper}>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={50}>
        <div>
          <Title className={classes.title}>Contact us</Title>
          <Text className={classes.description} color='white' mt="sm" mb={30}>
            Leave your email and we will get back to you within 24 hours
          </Text>
          <Stack mb={20}>
            {contactInfo.map((item, i) => (
              <ContactIcon key={i} {...item} />
            ))}
          </Stack>
          <Group>
            {socials.map((Icon, i) => (
              <ActionIcon size={28} key={i}>
                <Icon size={22} />
              </ActionIcon>
            ))}
          </Group>
        </div>
        <div className={classes.form}>
          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            classNames={{ input: classes.input, label: classes.inputLabel }}
          />
          <TextInput
            label="Name"
            placeholder="John Doe"
            mt="md"
            classNames={{ input: classes.input, label: classes.inputLabel }}
          />
          <Textarea
            required
            label="Your message"
            placeholder="I want to order your goods"
            minRows={4}
            mt="md"
            classNames={{ input: classes.input, label: classes.inputLabel }}
          />

          <Group justify="flex-end" mt="md">
            <Button className={classes.control} color="#fcc419">Send message</Button>
          </Group>
        </div>
      </SimpleGrid>
    </div>
  );
};

export default ContactSection;
