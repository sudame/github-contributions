const express = require('express');
const libxmljs = require('libxmljs');
const axios = require('axios');
const moment = require('moment');

const app = express();

app.get('/', (req, res) => {
  res.send(
    'Useage: access /&lt;username&gt; and get GitHub contributions count.'
  );
});

app.get('/:name', (req, res) => {
  const username = encodeURIComponent(req.params.name);

  axios
    .get(`https://github.com/users/${username}/contributions`)
    .then(axiosRes => {
      const xml = axiosRes.data;
      const xmlDoc = libxmljs.parseXml(xml);
      const result = {};

      for (let i = 0; i < 366; i++) {
        const formatedDate = moment()
          .subtract(i, 'd')
          .format('YYYY-MM-DD');

        const count = xmlDoc
          .get(`//rect[@data-date="${formatedDate}"]`)
          .attr('data-count')
          .value();

        result[formatedDate] = count;
      }
      res.send(result);
    })
    .catch(e => {
      res.sendStatus(e.response.status);
    });
});

app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), () => {
  console.log('Node app is running at http://localhost:' + app.get('port'));
});
