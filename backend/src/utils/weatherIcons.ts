export interface WeatherCodeInfo {
  condition: string;
  description: string;
  icon: string; // Lucide icon name or emoji
}

export const getWeatherDescription = (code: number): WeatherCodeInfo => {
  switch (code) {
    case 0:
      return { condition: 'Clear', description: 'Clear sky', icon: 'Sun' };
    case 1:
      return { condition: 'Mainly Clear', description: 'Mainly clear sky', icon: 'SunMedium' };
    case 2:
      return { condition: 'Partly Cloudy', description: 'Partly cloudy sky', icon: 'CloudSun' };
    case 3:
      return { condition: 'Overcast', description: 'Overcast clouds', icon: 'Cloud' };
    case 45:
      return { condition: 'Fog', description: 'Foggy conditions', icon: 'CloudFog' };
    case 48:
      return { condition: 'Depositing Rime Fog', description: 'Depositing rime fog', icon: 'CloudFog' };
    case 51:
      return { condition: 'Light Drizzle', description: 'Light drizzle', icon: 'CloudDrizzle' };
    case 53:
      return { condition: 'Moderate Drizzle', description: 'Moderate drizzle', icon: 'CloudDrizzle' };
    case 55:
      return { condition: 'Dense Drizzle', description: 'Dense drizzle', icon: 'CloudDrizzle' };
    case 56:
    case 57:
      return { condition: 'Freezing Drizzle', description: 'Freezing drizzle', icon: 'CloudSnow' };
    case 61:
      return { condition: 'Slight Rain', description: 'Slight rain showers', icon: 'CloudRain' };
    case 63:
      return { condition: 'Moderate Rain', description: 'Moderate rain', icon: 'CloudRain' };
    case 65:
      return { condition: 'Heavy Rain', description: 'Heavy continuous rain', icon: 'CloudRainWind' };
    case 66:
    case 67:
      return { condition: 'Freezing Rain', description: 'Freezing rain', icon: 'CloudSnow' };
    case 71:
      return { condition: 'Slight Snow', description: 'Slight snowfall', icon: 'Snowflake' };
    case 73:
      return { condition: 'Moderate Snow', description: 'Moderate snowfall', icon: 'Snowflake' };
    case 75:
      return { condition: 'Heavy Snow', description: 'Heavy snowfall', icon: 'Snowflake' };
    case 77:
      return { condition: 'Snow Grains', description: 'Snow grains', icon: 'Snowflake' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', description: 'Violent rain showers', icon: 'CloudRainWind' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', description: 'Snow showers', icon: 'CloudSnow' };
    case 95:
      return { condition: 'Thunderstorm', description: 'Thunderstorm', icon: 'CloudLightning' };
    case 96:
    case 99:
      return { condition: 'Thunderstorm with Hail', description: 'Thunderstorm with heavy hail', icon: 'CloudLightning' };
    default:
      return { condition: 'Unknown', description: 'Atmospheric conditions', icon: 'Cloud' };
  }
};
