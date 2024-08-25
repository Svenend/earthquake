console.log("This is working");

(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {

        const earthquakeCols = [
            {
                id: "id",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "place",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "time",
                dataType: tableau.dataTypeEnum.datetime,
            },
            {
                id: "mag",
                dataType: tableau.dataTypeEnum.float,
            },
            {
                id: "depth",
                dataType: tableau.dataTypeEnum.float,
            },
            {
                id: "latitude",
                dataType: tableau.dataTypeEnum.float,
            },
            {
                id: "longitude",
                dataType: tableau.dataTypeEnum.float,
            },
            {
                id: "felt",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "cdi",
                dataType: tableau.dataTypeEnum.float,
            },
            {
                id: "mmi",
                dataType: tableau.dataTypeEnum.float,
            },
            {
                id: "alert",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "tsunami",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "sig",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "code",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "sources",
                dataType: tableau.dataTypeEnum.string,
            }
        ];

        let earthquakeTableSchema = {
            id: "EarthquakeData",
            alias: "USGS Earthquake Data",
            columns: earthquakeCols,
        };

        schemaCallback([earthquakeTableSchema]);
    };

    myConnector.getData = function (table, doneCallback) {
        let tableData = [];
        console.time("DataFetch"); // Start time measurement

        // API-Abfrage auf Erdbeben in Japan ab dem 01.01.2024 beschränken
        $.getJSON(
            "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-01-01&minlatitude=24.4&maxlatitude=45.6&minlongitude=122.9&maxlongitude=153.9&minmagnitude=0",
            function (resp) {
                console.timeEnd("DataFetch"); // End time measurement for data fetch
                console.time("DataProcessing"); // Start time measurement for data processing
                let features = resp.features;

                console.log(`Number of features: ${features.length}`);

                for (let i = 0; i < features.length; i++) {
                    let earthquake = features[i];
                    let properties = earthquake.properties;
                    let geometry = earthquake.geometry;

                    tableData.push({
                        id: earthquake.id,
                        place: properties.place,
                        time: new Date(properties.time),
                        mag: properties.mag,
                        depth: geometry.coordinates[2],
                        latitude: geometry.coordinates[1],
                        longitude: geometry.coordinates[0],
                        felt: properties.felt,
                        cdi: properties.cdi,
                        mmi: properties.mmi,
                        alert: properties.alert,
                        tsunami: properties.tsunami,
                        sig: properties.sig,
                        code: properties.code,
                        sources: properties.sources
                    });

                    // Optional: Log progress every 1000 entries
                    if (i % 1000 === 0) {
                        console.log(`Processed ${i} entries`);
                    }
                }

                table.appendRows(tableData);
                doneCallback();
                console.timeEnd("DataProcessing"); // End time measurement for data processing
            }
        );
    };

    tableau.registerConnector(myConnector);
})();

document.querySelector("#getData").addEventListener('click', getData);

function getData() {
    tableau.connectionName = "USGS Earthquake Data";
    tableau.submit();
}