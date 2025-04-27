/**
 * Calculate the cluster memberships for each datapoint based on the squared distances to the centroids
 * @param {number[][]} squared_distances_for_all_datapoints An array of arrays, where each inner array contains the squared distances of a single datapoint to all centroids
 * @param {number} fuzziness The fuzziness parameter for the FCM algorithm
 * @throws {Error} If fuzziness is less than or equal to 1
 * @returns 
 */
function getClusterMemberships(squared_distances_for_all_datapoints, fuzziness) {
  if (fuzziness <= 1) { throw new Error("Fuzziness must be greater than 1"); }
  const exponent = 1 / (fuzziness - 1);

  return squared_distances_for_all_datapoints.map((squared_distances_for_datapoint) => {
    return squared_distances_for_datapoint.map((distance, _, distances) => {
      const sum = distances.reduce((acc, d) => acc + Math.pow(distance / d, exponent), 0);
      return 1 / sum;
    });
  });
}

/**
 * Initialize the cluster memberships randomly
 * @param {number} num_datapoints The number of datapoints
 * @param {number} num_clusters The number of clusters
 * @param {number} fuzziness The fuzziness parameter for the FCM algorithm
 * @returns A 2D array with each row representing the membership of a datapoint to each cluster
 */
function createRandomMembershipMatrix(num_datapoints, num_clusters, fuzziness) {
  const distances = createRandom2dArray(num_datapoints, num_clusters);
  return getClusterMemberships(distances, fuzziness);
}

/**
 * Calculate the centroids of the clusters based on the data and cluster memberships
 * @param {number[][]} data An array of arrays, where each inner array represents a datapoint
 * @param {number[][]} cluster_memberships 
 * @param {number} fuzziness The fuzziness parameter for the FCM algorithm
 * @returns An array of arrays, where each inner array represents the centroid of a cluster
 */
function calculateClusterCentroids(data, cluster_memberships, fuzziness) {
  if (fuzziness <= 1) { throw new Error("Fuzziness must be greater than 1"); }
  if (data.length === 0) { throw new Error("Data cannot be empty"); }
  if (data.length !== cluster_memberships.length) { throw new Error("Data and memberships must have the same number of entries"); }

  const num_clusters = cluster_memberships[0].length;
  const num_data_dimensions = data[0].length;
  return Array(num_clusters).fill(null).map((_, cluster_index) => {

    const numerator = data.reduce((acc, datapoint, datapoint_index) => {
      const membership = Math.pow(cluster_memberships[datapoint_index][cluster_index], fuzziness);
      return acc.map((value, index) => value + membership * datapoint[index]);
    }, Array(num_data_dimensions).fill(0));

    const denominator = cluster_memberships.reduce((acc, _, datapoint_index) => {
      return acc + Math.pow(cluster_memberships[datapoint_index][cluster_index], fuzziness);
    }, 0);

    return numerator.map(value => value / denominator);
  });
}

/**
 * Calculate the squared distances between each datapoint and each centroid
 * @param {number[][]} data An array of arrays, where each inner array represents a datapoint
 * @param {number[][]} centroids An array of arrays, where each inner array represents a cluster centroid
 * @returns A 2D array of squared distances, where each inner array contains the squared distances of a single datapoint to all centroids
 */
function calculateSquaredDistances(data, centroids) {
  if (data.length === 0) { throw new Error("Data cannot be empty"); }
  if (centroids.length === 0) { throw new Error("Centroids cannot be empty"); }
  if (data[0].length !== centroids[0].length) { throw new Error("Data and centroids must have the same number of dimensions"); }

  return data.map(datapoint => {
    return centroids.map(centroid => {
      return datapoint.reduce((acc, value, index) => {
        return acc + Math.pow(value - centroid[index], 2);
      }, 0);
    });
  });
}
/**
 * Calculate the Fuzzy C-Means clustering algorithm
 * @param {number[][]} data An array of arrays, where each inner array represents a datapoint
 * @param {number} fuzziness The fuzziness parameter for the FCM algorithm
 * @param {number} num_clusters The number of clusters to form
 * @param {number} max_iterations The maximum number of iterations to run the algorithm
 * @param {number} tolerance The tolerance for convergence
 */
function calculateFuzzyCMeans(data, fuzziness, num_clusters = 2, max_iterations = 100, tolerance = 1e-5) {
  if (fuzziness <= 1) { throw new Error("Fuzziness must be greater than 1"); }
  if (data.length === 0) { throw new Error("Data cannot be empty"); }
  if (data[0].length === 0) { throw new Error("Data cannot have empty dimensions"); }
  console.log(`Starting to cluster with FCM. Fuzziness: ${fuzziness}, Number of clusters: ${num_clusters}, Max iterations: ${max_iterations}, Tolerance: ${tolerance}`);
  console.log(`Data:\n${data.map(datapoint => "(" + datapoint.join(", ") + ")").join("\n")}`);

  const num_datapoints = data.length;

  let cluster_memberships = createRandomMembershipMatrix(num_datapoints, num_clusters, fuzziness);
  let centroids = calculateClusterCentroids(data, cluster_memberships, fuzziness);

  for (let iteration = 0; iteration < max_iterations; iteration++) {
    console.log(`Iteration ${iteration + 1} of ${max_iterations}`);
    const squared_distances = calculateSquaredDistances(data, centroids);
    const new_cluster_memberships = getClusterMemberships(squared_distances, fuzziness);
    const new_centroids = calculateClusterCentroids(data, new_cluster_memberships, fuzziness);

    const membership_changes = elementWiseSubtract(new_cluster_memberships, cluster_memberships);
    const change = calculateFrobeniusNorm2D(membership_changes);

    cluster_memberships = new_cluster_memberships;
    centroids = new_centroids;

    console.log(`Centroids:\n${centroids.map(centroid => "(" + centroid.join(", ") + ")").join("\n")}`);

    if (change < tolerance) { break; }
  }

  return { centroids, memberships: cluster_memberships };
}
