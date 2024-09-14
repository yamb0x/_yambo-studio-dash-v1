import React, { useState } from 'react';
import { TextField, Button, Box, InputAdornment, MenuItem, Typography, Checkbox, FormControlLabel, Select, Chip, ListItemText, Autocomplete, ListSubheader, Grid } from '@mui/material';
import { useArtists } from '../../contexts/ArtistContext';

// Complete list of countries
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
  'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'North Korea', 'South Korea',
  'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
  'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
].sort();

const skillOptions = [
  'Animation',
  'Look Dev',
  'Rigging',
  'Creative Direction',
  'Production',
  'Simulations',
  'CAD',
  'Houdini',
  'Color Grading',
  'Compositing',
  '2D Animation',
  'Modeling',
  'Sound Design'
];

function ArtistForm({ artist = {}, onClose }) {
  const { addArtist, updateArtist } = useArtists();
  const [formData, setFormData] = useState({
    name: '',
    dailyRate: '',
    country: '',
    skills: [],
    email: '',
    website: '',
    behanceLink: '',
    instagramLink: '',
    favorite: false,
    ...artist
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSkillChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prevData => ({
      ...prevData,
      skills: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (artist.id) {
      updateArtist(formData);
    } else {
      addArtist(formData);
    }
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& > :not(style)': { m: 1 } }}>
      <TextField
        fullWidth
        label="Artist Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.favorite}
              onChange={(e) => setFormData(prevData => ({ ...prevData, favorite: e.target.checked }))}
            />
          }
          label="Favorite"
        />
      </Box>
      <TextField
        fullWidth
        label="Daily Rate"
        name="dailyRate"
        type="number"
        value={formData.dailyRate}
        onChange={handleChange}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
        required
      />
      <Autocomplete
        options={countries}
        renderInput={(params) => <TextField {...params} label="Country" />}
        value={formData.country}
        onChange={(event, newValue) => {
          setFormData(prev => ({ ...prev, country: newValue }));
        }}
      />
      <Autocomplete
        fullWidth
        multiple
        options={skillOptions}
        disableCloseOnSelect
        value={formData.skills}
        onChange={(event, newValue) => {
          setFormData(prevData => ({
            ...prevData,
            skills: newValue
          }));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Skills"
            placeholder="Choose artist skills"
            fullWidth
          />
        )}
        renderOption={(props, option, { selected }) => (
          <Grid item xs={6} {...props} style={{ padding: '2px 8px' }}>
            <Box display="flex" alignItems="center">
              <Checkbox
                style={{ padding: '0 4px 0 0' }}
                checked={selected}
              />
              <Typography variant="body2" style={{ fontSize: '0.875rem' }}>
                {option}
              </Typography>
            </Box>
          </Grid>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip 
              variant="outlined" 
              label={option} 
              {...getTagProps({ index })} 
              size="small"
            />
          ))
        }
        ListboxProps={{
          style: { 
            maxHeight: 280, // Increased from 200 to 280
            overflow: 'auto'
          }
        }}
        ListboxComponent={React.forwardRef((props, ref) => (
          <Grid container ref={ref} {...props} />
        ))}
        sx={{ width: '100%' }}
      />
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        label="Website"
        name="website"
        value={formData.website}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        label="Behance Link"
        name="behanceLink"
        value={formData.behanceLink}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        label="Instagram Link"
        name="instagramLink"
        value={formData.instagramLink}
        onChange={handleChange}
      />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" color="primary">
          {artist.id ? 'Update Artist' : 'Add Artist'}
        </Button>
      </Box>
    </Box>
  );
}

export default ArtistForm;
