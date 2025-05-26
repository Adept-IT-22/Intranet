import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';

// Styled expand icon for rotation
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const announcementsData = [
  {
    id: 1,
    title: 'System Maintenance Scheduled',
    date: 'May 25, 2025',
    summary: 'Our IT team will perform scheduled maintenance this weekend.',
    details:
      'The maintenance window will be from 10 PM Saturday to 4 AM Sunday. Expect downtime during this period. Please save your work.',
  },
  {
    id: 2,
    title: 'New Remote Work Policy',
    date: 'May 20, 2025',
    summary: 'We have updated our remote work guidelines effective June 1st.',
    details:
      'Employees can now work remotely up to three days a week. Please review the full policy document on the HR page.',
  },
];

export default function Announcements() {
  const [expandedId, setExpandedId] = useState(null);

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" align="center">
        Company Announcements
      </Typography>

      {announcementsData.map(({ id, title, date, summary, details }) => (
        <Card
          key={id}
          variant="outlined"
          sx={{ mb: 3, boxShadow: 3, borderRadius: 2, cursor: 'pointer' }}
          onClick={() => handleExpandClick(id)}
        >
          <CardContent>
            <Typography variant="h6" component="div" fontWeight="600">
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {date}
            </Typography>
            <Typography variant="body2" color="text.primary">
              {summary}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <Typography variant="body2" color="text.secondary">
              {expandedId === id ? 'Hide Details' : 'Read More'}
            </Typography>
            <ExpandMore
              expand={expandedId === id}
              onClick={(e) => {
                e.stopPropagation();
                handleExpandClick(id);
              }}
              aria-expanded={expandedId === id}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
          <Collapse in={expandedId === id} timeout="auto" unmountOnExit>
            <Divider />
            <CardContent>
              <Typography paragraph>{details}</Typography>
            </CardContent>
          </Collapse>
        </Card>
      ))}
    </Container>
  );
}
