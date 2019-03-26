$('document').ready(() => {

    const ordersTarget = $('#orders-chart');

    if (ordersTarget.length) {

        const
            ordersContext = ordersTarget[0].getContext('2d'),
            ordersChart = new Chart(ordersContext, {
                type: 'line',
                data: {
                    labels: ['January', 'February', 'Mars', 'April', 'May', 'June', 'Jule', 'August', 'Septembre', 'October', 'Novembre', 'Decembre'],
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

        // Setting up the orders dropdown.
        $('select').formSelect();
    }
});
