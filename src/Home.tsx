import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Bookmarklet = () => {
  return (
    <div>
      <Typography variant="h6">Bookmarklet</Typography>
      <Typography>We offer a bookmarklet so you can quickly highlight some text in your browser and go directly to suggesting cards. Drag the following link to your bookmarks:</Typography>
      <a id="bookmarklet" href="javascript:(function() { var selection = window.getSelection().toString(); var url = 'https://anki-card-creator.pages.dev/suggest?prompt=' + encodeURIComponent(selection); window.open(url, '_blank'); })();">Suggest Anki cards</a>
    </div>
  );
};

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <Typography variant="h6" component="p" align="center" sx={{ marginTop: 5 }}>
        Anki Card Creator is a tool that helps you create Anki cards quickly and easily using AI.
      </Typography>

      <Card sx={{ maxWidth: 345, borderRadius: 2, margin: 'auto', marginTop: 5 }}>
        <CardActionArea onClick={() => navigate('/suggest')}>
          <CardContent>
            <Typography variant="h5" component="div" align="center">
              Suggest cards with AI
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>

      <Typography>
        <Bookmarklet />
      </Typography>
    </div>
  );
}

export default Home;
