$('document').ready(() => {

    const
        labels = {
            months: ['January', 'February', 'Mars', 'April', 'May', 'June', 'Jule', 'August', 'Septembre', 'October', 'Novembre', 'Decembre']
        },
        ordersTarget = $('#orders-chart'),
        revenueTarget = $('#revenue-chart');

    // Setting up the orders' chart.
    if (ordersTarget.length) {

        const
            ordersContext = ordersTarget[0].getContext('2d'),
            ordersChart = new Chart(ordersContext, {
                type: 'line',
                data: {
                    labels: labels.months,
                    datasets: [{
                        label: 'Orders per month',
                        data: [10, 3, 6, 12, 7, 3, 15, 20, 22, 15, 10, 13]
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
    }

    // Setting up the revenue's chart.
    if (revenueTarget.length) {

        const
            revenueContext = revenueTarget[0].getContext('2d'),
            revenueChart = new Chart(revenueContext, {
                type: 'line',
                data: {
                    labels: labels.months,
                    datasets: [{
                        label: 'Revenue per month',
                        data: [700, 1300, 1600, 200, 700, 700, 800, 3500, 2200, 1000, 1400, 900]
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
    }

    // Setting up the orders dropdown.
    $('select').formSelect();
});
