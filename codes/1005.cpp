#include <iostream>
#include <cmath>
#include <vector>
#include <unordered_set>
#include <algorithm>
#include <string>
#include <map>
#include <unordered_map>
#define f(n) for (int i = 0; i < n; i++)
#define fr(i, n) for (int i = 0; i < n; i += 1)
#define ceil(a, b) (a + b - 1) / b
#define l long long int
#define vi vector<int>
#define pb(x) push_back(x)
using namespace std;
 
int main()
{
    int a, b;
    cin >> a >> b;
    int A = max(a, b);
    int B = min(a, b);
    a = A;
    b = B;
    int dp[a + 1][b + 1];
    f(b + 1)
        dp[i][i] = 0;
    for (int i = 1; i <= a; i++)
    {
        for (int j = 1; j <= b; j++)
        {
            if (i == j)
            {
                continue;
            }
            dp[i][j] = 1e9;
            for (int k = 1; k < i; k++)
            {
                dp[i][j] = min(dp[i][j], dp[k][j] + dp[i - k][j] + 1);
            }
            for (int k = 1; k < j; k++)
            {
                dp[i][j] = min(dp[i][j], dp[i][k] + dp[i][j - k] + 1);
            }
        }
    }
    cout << dp[a][b] << endl;
    return 0;
}