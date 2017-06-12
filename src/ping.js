#!/usr/bin/env node
const execa = require('execa');
const chalk = require('chalk');
const AsciiTable = require('ascii-table');
const hosts = {
  'fra-de-ping.vultr.com': 'Frankfurt, DE',
  'par-fr-ping.vultr.com': 'Paris, France',
  'ams-nl-ping.vultr.com': 'Amsterdam, NL',
  'lon-gb-ping.vultr.com': 'London, UK',
  'sgp-ping.vultr.com': 'Singapore',
  'nj-us-ping.vultr.com': 'New York (NJ)',
  'hnd-jp-ping.vultr.com': 'Tokyo, Japan',
  'il-us-ping.vultr.com': 'Chicago, Illinois',
  'ga-us-ping.vultr.com': 'Atlanta, Georgia',
  'fl-us-ping.vultr.com': 'Miami, Florida',
  'wa-us-ping.vultr.com': 'Seattle, Washington',
  'tx-us-ping.vultr.com': 'Dallas, Texas',
  'sjo-ca-us-ping.vultr.com': 'Silicon Valley, California',
  'lax-ca-us-ping.vultr.com': 'Los Angeles, California',
  'syd-au-ping.vultr.com': 'Sydney, Australia',
  'speedtest-nyc1.digitalocean.com': 'DO - NYC1',
  'speedtest-nyc2.digitalocean.com': 'DO - NYC3',
  'speedtest-nyc3.digitalocean.com': 'DO - NYC3',
  'speedtest-ams2.digitalocean.com': 'DO-AMS2',
  'speedtest-ams3.digitalocean.com': 'DO-AMS3',
  'speedtest-sfo1.digitalocean.com': 'DO-SFO1',
  'speedtest-sfo2.digitalocean.com': 'DO-SFO2',
  'speedtest-sgp1.digitalocean.com': 'DO-SGP1',
  'speedtest-lon1.digitalocean.com': 'DO-LON1',
  'speedtest-fra1.digitalocean.com': 'DO-FRA1',
  'speedtest-tor1.digitalocean.com': 'DO-TOR1',
  'speedtest-blr1.digitalocean.com': 'DO-BLR1'
};
const promises = [];
for (const host of Object.keys(hosts)) {
  promises.push(execa.shell(`/sbin/ping -c 10 -t 500 ${host}`));
}
function colorFul(value, yellow = 100, red = 300) {
  const v = parseFloat(value);
  if (v > red) {
    return chalk.red(value);
  }
  if (v > yellow) {
    return chalk.yellow(value);
  }
  return chalk.green(value);
}
Promise.all(promises).then((result) => {
  const rows = [];
  result.forEach(ret => {
    const info = ret.stdout.split('\n\n')[1].split('\n');
    let row = [];
    const host = info[0].match(/--- (\S+) ping statistics ---/)[1];
    row.push(`[${hosts[host]}] ${host}`);
    const packets = info[1].match(/(\d+)[^,]+\, (\d+) packets received,\s*([^\s]+) packet loss/);
    packets.shift();
    row = row.concat(packets);
    let costs = info[2].match(new RegExp('round-trip min\/avg\/max\/stddev = ([^\/]+)/([^\/]+)/([^\/]+)/([^\/ ]+) ms'));
    costs.shift();
    row = row.concat(costs);
    rows.push(row);
  });
  const table = new AsciiTable().fromJSON({
    title: 'Multi ping',
    heading: ['host', 'transmitted', 'received', 'loss', 'min', 'avg', 'max', 'stddev'],
    rows
  });
  table.sortColumn(5, (a, b) => {
    a = parseFloat(a);
    b = parseFloat(b);
    if (a === b) {
      return 0;
    }
    return a > b ? 1 : -1;
  });
  console.log(table.toString());
}).catch((error) => {
  console.error('error', error);
});
