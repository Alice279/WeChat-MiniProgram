const LOCATION_KEY = "location";

export async function getLocation(): Promise<string> {
  try {
    const res = await wx.getStorage({ key: LOCATION_KEY });
    return res.data;
  } catch (e) {
    console.error(e);
    return "石油大院";
  }
}

export function getLocationSync(): string {
  let data = wx.getStorageSync(LOCATION_KEY);
  if (!data) {
    data = "石油大院";
  }
  return data;
}
export function setLocationSync(lo: string) {
  wx.setStorageSync(LOCATION_KEY, lo);
}
